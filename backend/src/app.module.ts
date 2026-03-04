import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MongoModule } from './database/mongo/mongo.module';
import { ClickHouseModule } from './database/clickhouse/clickhouse.module';
import { RedisModule } from './database/redis/redis.module';
import { HealthModule } from './modules/health/health.module';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import {UsersModule} from "./modules/users/users.module";
import {AuthModule} from "./modules/auth/auth.module";
import {PromocodesModule} from "./modules/promocodes/promocodes.module";
import {OrdersModule} from "./modules/orders/orders.module";
import {AnalyticsModule} from "./modules/analytics/analytics.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [appConfig, databaseConfig, jwtConfig],
        }),
        MongoModule,
        ClickHouseModule,
        RedisModule,
        HealthModule,
        UsersModule,
        AuthModule,
        PromocodesModule,
        OrdersModule,
        AnalyticsModule,
    ],
})
export class AppModule {}