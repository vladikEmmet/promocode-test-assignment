import type {ColumnDef} from '@tanstack/react-table';
import {format} from 'date-fns';
import {Pencil, PowerOff} from 'lucide-react';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import type {UserAnalytics} from '@/types';

interface UseUserColumnsProps {
    currentUserEmail: string | undefined;
    onEdit: (user: UserAnalytics) => void;
    onDeactivate: (id: string) => void;
}

export function useUserColumns({
                                   currentUserEmail,
                                   onEdit,
                                   onDeactivate
                               }: UseUserColumnsProps): ColumnDef<UserAnalytics>[] {
    return [
        {accessorKey: 'email', header: 'Email', enableSorting: true},
        {accessorKey: 'name', header: 'Имя', enableSorting: true},
        {accessorKey: 'phone', header: 'Телефон', enableSorting: false},
        {
            accessorKey: 'is_active',
            header: 'Статус',
            enableSorting: false,
            cell: ({row}) => (
                <Badge variant={row.original.is_active === 1 ? 'default' : 'secondary'}>
                    {row.original.is_active === 1 ? 'Активен' : 'Неактивен'}
                </Badge>
            ),
        },
        {accessorKey: 'total_orders', header: 'Заказов', enableSorting: true},
        {
            accessorKey: 'total_amount',
            header: 'Сумма заказов',
            enableSorting: true,
            cell: ({row}) => `${Number(row.original.total_amount).toLocaleString()} ₽`,
        },
        {
            accessorKey: 'total_discount',
            header: 'Скидок',
            enableSorting: true,
            cell: ({row}) => `${Number(row.original.total_discount).toLocaleString()} ₽`,
        },
        {accessorKey: 'promo_usages', header: 'Промокодов', enableSorting: true},
        {
            accessorKey: 'created_at',
            header: 'Дата регистрации',
            enableSorting: true,
            cell: ({row}) => format(new Date(row.original.created_at), 'dd.MM.yyyy'),
        },
        {
            id: 'actions',
            header: '',
            enableSorting: false,
            cell: ({row}) => {
                const isSelf = currentUserEmail === row.original.email;
                const isActive = row.original.is_active === 1;
                return (
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(row.original)}>
                            <Pencil size={14}/>
                        </Button>
                        {isActive && (
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={isSelf}
                                title={isSelf ? 'Нельзя деактивировать себя' : 'Деактивировать'}
                                onClick={() => onDeactivate(row.original.id)}
                            >
                                <PowerOff size={14}/>
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ];
}