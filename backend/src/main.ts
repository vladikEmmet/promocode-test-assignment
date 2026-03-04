import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {GlobalExceptionFilter} from "./common/filters/http-exception.filter";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.enableCors({
        origin: 'http://localhost:5173',
        credentials: true,
    });

    const config = new DocumentBuilder()
        .setTitle('PromoCode Manager API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

    app.useGlobalFilters(new GlobalExceptionFilter())

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();