import {
    Controller, Get, Post, Patch,
    Delete, Param, Body, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { PromocodesService } from './promocodes.service';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { UpdatePromocodeDto } from './dto/update-promocode.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Promocodes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('promocodes')
export class PromocodesController {
    constructor(private readonly promocodesService: PromocodesService) {}

    @Post()
    create(@Body() dto: CreatePromocodeDto) {
        return this.promocodesService.create(dto);
    }

    @Get()
    findAll() {
        return this.promocodesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.promocodesService.findById(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdatePromocodeDto) {
        return this.promocodesService.update(id, dto);
    }

    @Delete(':id')
    deactivate(@Param('id') id: string) {
        return this.promocodesService.deactivate(id);
    }
}