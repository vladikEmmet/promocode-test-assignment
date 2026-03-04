import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
    providers: [
        {
            provide: REDIS_CLIENT,
            inject: [ConfigService],
            useFactory: (config: ConfigService): Redis => {
                const client = new Redis({
                    host: config.get<string>('database.redis.host'),
                    port: config.get<number>('database.redis.port'),
                    password: config.get<string>('database.redis.password'),
                });

                client.on('error', (err) =>
                    console.error('[Redis] error:', err.message),
                );

                return client;
            },
        },
    ],
    exports: [REDIS_CLIENT],
})
export class RedisModule {}