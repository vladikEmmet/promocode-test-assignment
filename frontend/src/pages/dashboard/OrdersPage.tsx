import {format} from 'date-fns';
import {Plus, Tag} from 'lucide-react';

import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {CreateOrderDialog} from '@/components/forms/CreateOrderDialog';
import {ApplyPromocodeDialog} from '@/components/forms/ApplyPromocodeDialog';
import {useOrders} from '@/hooks/useOrders';
import type {Order} from '@/types';

export function OrdersPage() {
    const {orders, isLoading, openCreateDialog, openApplyDialog, createDialog, applyDialog} = useOrders();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Мои заказы</h1>
                    <p className="text-slate-500 text-sm">Создавайте заказы и применяйте промокоды</p>
                </div>
                <Button onClick={openCreateDialog}>
                    <Plus size={16} className="mr-2"/>
                    Создать заказ
                </Button>
            </div>

            {isLoading ? (
                <p className="text-slate-400">Загрузка...</p>
            ) : !orders?.length ? (
                <Card>
                    <CardContent className="flex items-center justify-center h-32 text-slate-400">
                        Заказов пока нет
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3">
                    {orders.map((order: Order) => (
                        <Card key={order._id}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-mono text-slate-400">
                                        #{order._id.slice(-8).toUpperCase()}
                                    </CardTitle>
                                    <span className="text-sm text-slate-400">
                                        {format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm')}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="font-medium text-lg">
                                            {order.amount.toLocaleString()} ₽
                                        </p>
                                        {order.promocodeCode ? (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant="default">
                                                    <Tag size={12} className="mr-1"/>
                                                    {order.promocodeCode}
                                                </Badge>
                                                <span className="text-sm text-green-600 font-medium">
                                                    −{order.discountAmount?.toLocaleString()} ₽
                                                </span>
                                                <span className="text-sm text-slate-500">→</span>
                                                <span className="text-sm font-semibold">
                                                    {(order.amount - (order.discountAmount ?? 0)).toLocaleString()} ₽
                                                </span>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-400">Промокод не применён</p>
                                        )}
                                    </div>
                                    {!order.promocodeCode && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openApplyDialog(order._id)}
                                        >
                                            <Tag size={14} className="mr-2"/>
                                            Применить промокод
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <CreateOrderDialog {...createDialog} />
            <ApplyPromocodeDialog {...applyDialog} />
        </div>
    );
}