import { Injectable, Inject } from '@nestjs/common';
import { ClickHouseClient } from '@clickhouse/client';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { CLICKHOUSE_CLIENT } from '../../database/clickhouse/clickhouse.module';
import { REDIS_CLIENT } from '../../database/redis/redis.module';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import {
    PaginatedResponse,
    UserAnalyticsRow,
    PromocodeAnalyticsRow,
    PromoUsageRow,
} from './dto/analytics-response.dto';

const CACHE_TTL = 30;

@Injectable()
export class AnalyticsService {
    private readonly db: string;

    constructor(
        @Inject(CLICKHOUSE_CLIENT) private readonly ch: ClickHouseClient,
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
        private readonly config: ConfigService,
    ) {
        this.db = config.get<string>('database.clickhouse.database')!;
    }

    async getUsers(query: AnalyticsQueryDto): Promise<PaginatedResponse<UserAnalyticsRow>> {
        return this.withCache('analytics:users', query, () => this.fetchUsers(query));
    }

    async getPromocodes(query: AnalyticsQueryDto): Promise<PaginatedResponse<PromocodeAnalyticsRow>> {
        return this.withCache('analytics:promocodes', query, () => this.fetchPromocodes(query));
    }

    async getPromoUsages(query: AnalyticsQueryDto): Promise<PaginatedResponse<PromoUsageRow>> {
        return this.withCache('analytics:promo-usages', query, () => this.fetchPromoUsages(query));
    }

    private async withCache<T>(
        prefix: string,
        query: AnalyticsQueryDto,
        fetcher: () => Promise<T>,
    ): Promise<T> {
        const cacheKey = `${prefix}:${JSON.stringify(query)}`;

        try {
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                return JSON.parse(cached) as T;
            }
        } catch (err) {
            console.error('[Redis] Cache read error:', err);
        }

        const result = await fetcher();

        try {
            await this.redis.set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL);
        } catch (err) {
            console.error('[Redis] Cache write error:', err);
        }

        return result;
    }

    private async fetchUsers(
        query: AnalyticsQueryDto,
    ): Promise<PaginatedResponse<UserAnalyticsRow>> {
        const allowedSortFields = [
            'created_at', 'email', 'name',
            'total_orders', 'total_amount', 'promo_usages',
        ];
        const sortBy = allowedSortFields.includes(query.sortBy ?? '')
            ? query.sortBy!
            : 'created_at';
        const sortOrder = query.sortOrder === 'asc' ? 'ASC' : 'DESC';

        const searchFilter = query.search
            ? `AND (u.email ILIKE {search:String} OR u.name ILIKE {search:String})`
            : '';
        const dateFilter = this.buildDateFilter('u.created_at', query);

        const params: Record<string, unknown> = {
            limit: query.limit,
            offset: query.offset,
        };
        if (query.dateFrom) params.dateFrom = query.dateFrom;
        if (query.dateTo) params.dateTo = query.dateTo;
        if (query.search) params.search = `%${query.search}%`;

        const dataQuery = `
      SELECT
        u.id, u.email, u.name, u.phone, u.is_active, u.created_at,
        countIf(o.id != '') AS total_orders,
        coalesce(sum(o.amount), 0) AS total_amount,
        coalesce(sum(o.discount_amount), 0) AS total_discount,
        countIf(o.promocode_id != '') AS promo_usages
      FROM ${this.db}.users u FINAL
      LEFT JOIN ${this.db}.orders o ON o.user_id = u.id
      WHERE 1=1 ${dateFilter} ${searchFilter}
      GROUP BY u.id, u.email, u.name, u.phone, u.is_active, u.created_at
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT {limit:UInt32} OFFSET {offset:UInt32}
    `;

        const countQuery = `
      SELECT count() AS total
      FROM (
        SELECT u.id
        FROM ${this.db}.users u FINAL
        WHERE 1=1 ${dateFilter} ${searchFilter}
        GROUP BY u.id
      )
    `;

        const [dataResult, countResult] = await Promise.all([
            this.ch.query({ query: dataQuery, query_params: params, format: 'JSONEachRow' }),
            this.ch.query({ query: countQuery, query_params: params, format: 'JSONEachRow' }),
        ]);

        const data = await dataResult.json<UserAnalyticsRow>();
        const countRows = await countResult.json<{ total: string }>();
        const total = parseInt(countRows[0]?.total ?? '0', 10);

        return this.paginate(data, total, query);
    }

    private async fetchPromocodes(
        query: AnalyticsQueryDto,
    ): Promise<PaginatedResponse<PromocodeAnalyticsRow>> {
        const allowedSortFields = [
            'created_at', 'code', 'discount',
            'total_usages', 'total_revenue', 'unique_users',
        ];
        const sortBy = allowedSortFields.includes(query.sortBy ?? '')
            ? query.sortBy!
            : 'created_at';
        const sortOrder = query.sortOrder === 'asc' ? 'ASC' : 'DESC';

        const dateFilter = this.buildDateFilter('p.created_at', query);
        const searchFilter = query.search
            ? `AND p.code ILIKE {search:String}`
            : '';

        const params: Record<string, unknown> = {
            limit: query.limit,
            offset: query.offset,
        };
        if (query.dateFrom) params.dateFrom = query.dateFrom;
        if (query.dateTo) params.dateTo = query.dateTo;
        if (query.search) params.search = `%${query.search}%`;

        const dataQuery = `
            SELECT
                p.id, p.code, p.discount, p.usage_limit, p.per_user_limit,
                p.date_from, p.date_to, p.is_active, p.created_at,
                count(pu.id) AS total_usages,
                coalesce(sum(pu.order_amount), 0) AS total_revenue,
                coalesce(sum(pu.discount_amount), 0) AS total_discount_given,
                uniq(pu.user_id) AS unique_users
            FROM ${this.db}.promocodes p FINAL
                     LEFT JOIN ${this.db}.promo_usages pu ON pu.promocode_id = p.id
            WHERE 1=1 ${dateFilter} ${searchFilter}
            GROUP BY p.id, p.code, p.discount, p.usage_limit, p.per_user_limit,
                p.date_from, p.date_to, p.is_active, p.created_at
            ORDER BY ${sortBy} ${sortOrder}
                LIMIT {limit:UInt32} OFFSET {offset:UInt32}
        `;

        const countQuery = `
            SELECT count() AS total
            FROM ${this.db}.promocodes p FINAL
            WHERE 1=1 ${searchFilter}
        `;

        const [dataResult, countResult] = await Promise.all([
            this.ch.query({ query: dataQuery, query_params: params, format: 'JSONEachRow' }),
            this.ch.query({ query: countQuery, query_params: params, format: 'JSONEachRow' }),
        ]);

        const data = await dataResult.json<PromocodeAnalyticsRow>();
        const countRows = await countResult.json<{ total: string }>();
        const total = parseInt(countRows[0]?.total ?? '0', 10);

        return this.paginate(data, total, query);
    }

    private async fetchPromoUsages(
        query: AnalyticsQueryDto,
    ): Promise<PaginatedResponse<PromoUsageRow>> {
        const allowedSortFields = [
            'used_at', 'discount_amount', 'order_amount',
            'promocode_code', 'user_email',
        ];
        const sortBy = allowedSortFields.includes(query.sortBy ?? '')
            ? query.sortBy!
            : 'used_at';
        const sortOrder = query.sortOrder === 'asc' ? 'ASC' : 'DESC';

        const dateFilter = this.buildDateFilter('used_at', query);
        const searchFilter = query.search
            ? `AND (promocode_code ILIKE {search:String} OR user_email ILIKE {search:String})`
            : '';

        const params: Record<string, unknown> = {
            limit: query.limit,
            offset: query.offset,
        };
        if (query.dateFrom) params.dateFrom = query.dateFrom;
        if (query.dateTo) params.dateTo = query.dateTo;
        if (query.search) params.search = `%${query.search}%`;

        const baseWhere = `WHERE 1=1 ${dateFilter} ${searchFilter}`;

        const dataQuery = `
      SELECT id, promocode_code, user_email, user_name,
             order_id, order_amount, discount_amount, used_at
      FROM ${this.db}.promo_usages
      ${baseWhere}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT {limit:UInt32} OFFSET {offset:UInt32}
    `;

        const countQuery = `
      SELECT count() AS total
      FROM ${this.db}.promo_usages
      ${baseWhere}
    `;

        const [dataResult, countResult] = await Promise.all([
            this.ch.query({ query: dataQuery, query_params: params, format: 'JSONEachRow' }),
            this.ch.query({ query: countQuery, query_params: params, format: 'JSONEachRow' }),
        ]);

        const data = await dataResult.json<PromoUsageRow>();
        const countRows = await countResult.json<{ total: string }>();
        const total = parseInt(countRows[0]?.total ?? '0', 10);

        return this.paginate(data, total, query);
    }

    private buildDateFilter(field: string, query: AnalyticsQueryDto): string {
        const parts: string[] = [];

        if (query.dateFrom)
            parts.push(`AND ${field} >= parseDateTimeBestEffort({dateFrom:String})`);

        if (query.dateTo)
            parts.push(
                `AND ${field} < addDays(parseDateTimeBestEffort({dateTo:String}), 1)`
            );

        return parts.join(' ');
    }

    private paginate<T>(data: T[], total: number, query: AnalyticsQueryDto): PaginatedResponse<T> {
        return {
            data,
            total,
            page: query.page,
            limit: query.limit,
            totalPages: Math.ceil(total / query.limit),
        };
    }
}