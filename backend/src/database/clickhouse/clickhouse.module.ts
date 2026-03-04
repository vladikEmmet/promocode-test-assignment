import {
    Module, Global, Injectable,
    OnApplicationBootstrap, Logger, Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, ClickHouseClient } from '@clickhouse/client';

export const CLICKHOUSE_CLIENT = 'CLICKHOUSE_CLIENT';

@Injectable()
class ClickHouseMigrationsService implements OnApplicationBootstrap {
    private readonly logger = new Logger('ClickHouseMigrations');

    constructor(
        @Inject(CLICKHOUSE_CLIENT) private readonly ch: ClickHouseClient,
        private readonly config: ConfigService,
    ) {}

    async onApplicationBootstrap() {
        const db = this.config.get<string>('database.clickhouse.database')!;
        this.logger.log('Running migrations...');
        await this.createDatabase(db);
        await this.createTables(db);
        this.logger.log('Migrations complete ✓');
    }

    private async createDatabase(db: string) {
        await this.ch.exec({
            query: `CREATE DATABASE IF NOT EXISTS ${db}`,
        });
    }

    private async createTables(db: string) {
        const tables = [
            `CREATE TABLE IF NOT EXISTS ${db}.users (
        id         String,
        email      String,
        name       String,
        phone      String,
        is_active  UInt8,
        created_at DateTime,
        updated_at DateTime
      ) ENGINE = ReplacingMergeTree(updated_at)
        ORDER BY (id)`,

            `CREATE TABLE IF NOT EXISTS ${db}.promocodes (
        id             String,
        code           String,
        discount       Float32,
        usage_limit    Nullable(Int32),
        per_user_limit Nullable(Int32),
        date_from      Nullable(DateTime),
        date_to        Nullable(DateTime),
        is_active      UInt8,
        created_at     DateTime,
        updated_at     DateTime
      ) ENGINE = ReplacingMergeTree(updated_at)
        ORDER BY (id)`,

            `CREATE TABLE IF NOT EXISTS ${db}.orders (
        id              String,
        user_id         String,
        user_email      String,
        user_name       String,
        amount          Float64,
        promocode_id    Nullable(String),
        promocode_code  Nullable(String),
        discount_amount Nullable(Float64),
        created_at      DateTime
      ) ENGINE = MergeTree()
        PARTITION BY toYYYYMM(created_at)
        ORDER BY (created_at, user_id)`,

            `CREATE TABLE IF NOT EXISTS ${db}.promo_usages (
        id              String,
        promocode_id    String,
        promocode_code  String,
        user_id         String,
        user_email      String,
        user_name       String,
        order_id        String,
        order_amount    Float64,
        discount_amount Float64,
        used_at         DateTime
      ) ENGINE = MergeTree()
        PARTITION BY toYYYYMM(used_at)
        ORDER BY (used_at, promocode_id)`,
        ];

        for (const query of tables) {
            await this.ch.exec({ query });
        }
    }
}

@Global()
@Module({
    providers: [
        {
            provide: CLICKHOUSE_CLIENT,
            inject: [ConfigService],
            useFactory: (config: ConfigService): ClickHouseClient =>
                createClient({
                    url: config.get<string>('database.clickhouse.host'),
                    username: config.get<string>('database.clickhouse.username'),
                    password: config.get<string>('database.clickhouse.password'),
                    database: config.get<string>('database.clickhouse.database'),
                }),
        },
        ClickHouseMigrationsService,
    ],
    exports: [CLICKHOUSE_CLIENT],
})
export class ClickHouseModule {}