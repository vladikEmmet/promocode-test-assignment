import {
    Controller, Get, Post,
    Param, Body, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApplyPromocodeDto } from './dto/apply-promocode.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserDocument } from '../users/user.schema';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    @ApiOperation({ summary: 'Create order' })
    create(@Body() dto: CreateOrderDto, @CurrentUser() user: UserDocument) {
        return this.ordersService.create(dto, user);
    }

    @Get('my')
    @ApiOperation({ summary: 'Get my orders' })
    findMy(@CurrentUser() user: UserDocument) {
        return this.ordersService.findMyOrders(user);
    }

    @Post(':id/apply-promocode')
    @ApiOperation({ summary: 'Apply promocode to existing order' })
    applyPromocode(
        @Param('id') id: string,
        @Body() dto: ApplyPromocodeDto,
        @CurrentUser() user: UserDocument,
    ) {
        return this.ordersService.applyPromocode(id, dto, user);
    }
}