import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    @Get('users')
    @ApiOperation({ summary: 'Users table with aggregated stats (ClickHouse)' })
    getUsers(@Query() query: AnalyticsQueryDto) {
        return this.analyticsService.getUsers(query);
    }

    @Get('promocodes')
    @ApiOperation({ summary: 'Promocodes table with metrics (ClickHouse)' })
    getPromocodes(@Query() query: AnalyticsQueryDto) {
        return this.analyticsService.getPromocodes(query);
    }

    @Get('promo-usages')
    @ApiOperation({ summary: 'Promo usage history (ClickHouse)' })
    getPromoUsages(@Query() query: AnalyticsQueryDto) {
        return this.analyticsService.getPromoUsages(query);
    }
}