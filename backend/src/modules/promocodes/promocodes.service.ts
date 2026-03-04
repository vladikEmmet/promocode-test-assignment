import {
    Injectable, NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Promocode, PromocodeDocument } from './promocode.schema';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { UpdatePromocodeDto } from './dto/update-promocode.dto';
import {toClickHouseDateTime} from "../../common/helpers/clickhouse-date.helper";
import {SyncService} from "../../common/services/sync.service";

@Injectable()
export class PromocodesService extends SyncService {
    protected cachePatterns = ['analytics:promocodes:*', 'analytics:users:*'];

    constructor(
        @InjectModel(Promocode.name)
        private readonly promocodeModel: Model<PromocodeDocument>,
    ) {
        super();
    }

    async create(dto: CreatePromocodeDto): Promise<PromocodeDocument> {
        const exists = await this.promocodeModel.findOne({ code: dto.code });
        if (exists) throw new ConflictException('Promocode already exists');

        const promocode = await this.promocodeModel.create({
            ...dto,
            dateFrom: dto.dateFrom ? new Date(dto.dateFrom) : null,
            dateTo: dto.dateTo ? new Date(dto.dateTo) : null,
            usageLimit: dto.usageLimit ?? null,
            perUserLimit: dto.perUserLimit ?? null,
        });

        await this.syncToClickHouse(promocode);
        return promocode;
    }

    async findAll(): Promise<PromocodeDocument[]> {
        return this.promocodeModel.find();
    }

    async findById(id: string): Promise<PromocodeDocument> {
        const promocode = await this.promocodeModel.findById(id);
        if (!promocode) throw new NotFoundException('Promocode not found');
        return promocode;
    }

    async findByCode(code: string): Promise<PromocodeDocument | null> {
        return this.promocodeModel.findOne({ code: code.toUpperCase() });
    }

    async update(id: string, dto: UpdatePromocodeDto): Promise<PromocodeDocument> {
        const promocode = await this.promocodeModel.findByIdAndUpdate(
            id,
            {
                ...dto,
                dateFrom: dto.dateFrom ? new Date(dto.dateFrom) : undefined,
                dateTo: dto.dateTo ? new Date(dto.dateTo) : undefined,
            },
            { new: true },
        );
        if (!promocode) throw new NotFoundException('Promocode not found');

        await this.syncToClickHouse(promocode);
        return promocode;
    }

    async deactivate(id: string): Promise<PromocodeDocument> {
        const promocode = await this.promocodeModel.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true },
        );
        if (!promocode) throw new NotFoundException('Promocode not found');

        await this.syncToClickHouse(promocode);
        return promocode;
    }

    async syncToClickHouse(promocode: PromocodeDocument): Promise<void> {
        await this.syncAndInvalidate(
            [{
                id:             promocode._id.toString(),
                code:           promocode.code,
                discount:       promocode.discount,
                usage_limit:    promocode.usageLimit ?? null,
                per_user_limit: promocode.perUserLimit ?? null,
                date_from:      toClickHouseDateTime(promocode.dateFrom),
                date_to:        toClickHouseDateTime(promocode.dateTo),
                is_active:      promocode.isActive ? 1 : 0,
                created_at:     toClickHouseDateTime(promocode.createdAt),
                updated_at:     toClickHouseDateTime(promocode.updatedAt),
            }],
            'promocodes',
            `sync promocode ${promocode._id.toString()}`,
        );
    }

    private async invalidateAnalyticsCache(): Promise<void> {
        try {
            const keys = await this.redis.keys('analytics:promocodes:*');
            if (keys.length > 0) await this.redis.del(...keys);
        } catch (err) {
            console.error('[Redis] Cache invalidation error:', err);
        }
    }
}