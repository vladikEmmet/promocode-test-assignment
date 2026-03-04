import { Inject } from '@nestjs/common';
import { ClickHouseClient } from '@clickhouse/client';
import Redis from 'ioredis';

import { CLICKHOUSE_CLIENT } from '../../database/clickhouse/clickhouse.module';
import { REDIS_CLIENT } from '../../database/redis/redis.module';
import { withRetry } from '../helpers/retry.helper';

export abstract class SyncService {
    @Inject(CLICKHOUSE_CLIENT) protected readonly ch!: ClickHouseClient;
    @Inject(REDIS_CLIENT) protected readonly redis!: Redis;

    protected abstract cachePatterns: string[];

    protected async syncAndInvalidate(
        values: Record<string, unknown>[],
        table: string,
        label: string,
    ): Promise<void> {
        await withRetry(
            () => this.ch.insert({ table, values, format: 'JSONEachRow' }),
            3, 500, label,
        );
        await this.invalidateCache();
    }

    private async invalidateCache(): Promise<void> {
        try {
            for (const pattern of this.cachePatterns) {
                const keys = await this.redis.keys(pattern);
                if (keys.length > 0) await this.redis.del(...keys);
            }
        } catch (err) {
            console.error('[Redis] Cache invalidation error:', err);
        }
    }
}