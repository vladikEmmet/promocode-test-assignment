import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
    mongo: {
        uri: process.env.MONGO_URI,
    },
    clickhouse: {
        host: process.env.CH_HOST,
        username: process.env.CH_USER,
        password: process.env.CH_PASSWORD,
        database: process.env.CH_DB,
    },
    redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
    },
}));