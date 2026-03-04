import type { Order } from '@/types';
import {privateApi} from "@/api/client.ts";

export const ordersService = {
    create: (amount: number) =>
        privateApi.post<Order>('/orders', { amount }).then(r => r.data),

    findMy: () =>
        privateApi.get<Order[]>('/orders/my').then(r => r.data),

    applyPromocode: (orderId: string, code: string) =>
        privateApi.post<Order>(`/orders/${orderId}/apply-promocode`, { code }).then(r => r.data),
};