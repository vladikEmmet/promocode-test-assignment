import {
    Injectable, NotFoundException, BadRequestException,
    Inject, ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';

import { Order, OrderDocument } from './order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApplyPromocodeDto } from './dto/apply-promocode.dto';
import { PromocodesService } from '../promocodes/promocodes.service';
import { UserDocument } from '../users/user.schema';
import { CLICKHOUSE_CLIENT } from '../../database/clickhouse/clickhouse.module';
import { REDIS_CLIENT } from '../../database/redis/redis.module';
import { ClickHouseClient } from '@clickhouse/client';
import {toClickHouseDateTime} from "../../common/helpers/clickhouse-date.helper";
import {withRetry} from "../../common/helpers/retry.helper";
import {SyncService} from "../../common/services/sync.service";

@Injectable()
export class OrdersService extends SyncService {
    protected cachePatterns = [
        'analytics:users:*',
        'analytics:promocodes:*',
        'analytics:promo-usages:*',
    ];

    constructor(
        @InjectModel(Order.name)
        private readonly orderModel: Model<OrderDocument>,
        private readonly promocodesService: PromocodesService,
    ) {
        super();
    }

    async create(dto: CreateOrderDto, user: UserDocument): Promise<OrderDocument> {
        const order = await this.orderModel.create({
            userId: user._id,
            amount: dto.amount,
        });

        await this.syncOrderToClickHouse(order, user);
        return order;
    }

    async findMyOrders(user: UserDocument): Promise<OrderDocument[]> {
        return this.orderModel.find({ userId: user._id }).sort({ createdAt: -1 });
    }

    async applyPromocode(
        orderId: string,
        dto: ApplyPromocodeDto,
        user: UserDocument,
    ): Promise<OrderDocument> {
        const lockKey = `lock:promocode:${dto.code}:${user._id.toString()}`;
        const lockValue = uuidv4();
        const acquired = await this.redis.set(lockKey, lockValue, 'EX', 10, 'NX');

        if (!acquired) {
            throw new BadRequestException('Request already in progress, try again');
        }

        try {
            return await this.doApplyPromocode(orderId, dto, user);
        } finally {
            const current = await this.redis.get(lockKey);
            if (current === lockValue) {
                await this.redis.del(lockKey);
            }
        }
    }

    private async doApplyPromocode(
        orderId: string,
        dto: ApplyPromocodeDto,
        user: UserDocument,
    ): Promise<OrderDocument> {
        const order = await this.orderModel.findById(orderId);
        if (!order) throw new NotFoundException('Order not found');

        if (order.userId.toString() !== user._id.toString()) {
            throw new ForbiddenException('This order does not belong to you');
        }

        if (order.promocodeId) {
            throw new BadRequestException('Promocode already applied to this order');
        }

        const promocode = await this.promocodesService.findByCode(dto.code);
        if (!promocode) throw new NotFoundException('Promocode not found');

        if (!promocode.isActive) {
            throw new BadRequestException('Promocode is not active');
        }

        const now = new Date();
        if (promocode.dateFrom && now < promocode.dateFrom) {
            throw new BadRequestException('Promocode is not valid yet');
        }
        if (promocode.dateTo && now > promocode.dateTo) {
            throw new BadRequestException('Promocode has expired');
        }

        if (promocode.usageLimit !== null) {
            const totalUsages = await this.orderModel.countDocuments({
                promocodeId: promocode._id,
            });
            if (totalUsages >= promocode.usageLimit) {
                throw new BadRequestException('Promocode usage limit reached');
            }
        }

        if (promocode.perUserLimit !== null) {
            const userUsages = await this.orderModel.countDocuments({
                userId: user._id,
                promocodeId: promocode._id,
            });
            if (userUsages >= promocode.perUserLimit) {
                throw new BadRequestException('You have reached the usage limit for this promocode');
            }
        }

        const discountAmount = (order.amount * promocode.discount) / 100;

        const updated = await this.orderModel.findByIdAndUpdate(
            orderId,
            {
                promocodeId: promocode._id,
                promocodeCode: promocode.code,
                discountAmount,
            },
            { new: true },
        );

        if (!updated) throw new NotFoundException('Order not found');

        await this.syncOrderToClickHouse(updated, user);

        await this.syncPromoUsageToClickHouse(updated, user, discountAmount);

        return updated;
    }

    private async syncOrderToClickHouse(order: OrderDocument, user: UserDocument): Promise<void> {
        await this.syncAndInvalidate(
            [{
                id:              order._id.toString(),
                user_id:         user._id.toString(),
                user_email:      user.email,
                user_name:       user.name,
                amount:          order.amount,
                promocode_id:    order.promocodeId?.toString() ?? null,
                promocode_code:  order.promocodeCode ?? null,
                discount_amount: order.discountAmount ?? null,
                created_at:      toClickHouseDateTime(order.createdAt),
            }],
            'orders',
            `sync order ${order._id.toString()}`,
        );
    }

    private async syncPromoUsageToClickHouse(
        order: OrderDocument,
        user: UserDocument,
        discountAmount: number,
    ): Promise<void> {
        const id = uuidv4();
        await this.syncAndInvalidate(
            [{
                id,
                promocode_id:    order.promocodeId!.toString(),
                promocode_code:  order.promocodeCode!,
                user_id:         user._id.toString(),
                user_email:      user.email,
                user_name:       user.name,
                order_id:        order._id.toString(),
                order_amount:    order.amount,
                discount_amount: discountAmount,
                used_at:         toClickHouseDateTime(new Date()),
            }],
            'promo_usages',
            `sync promo_usage for order ${order._id.toString()}`,
        );
    }
}