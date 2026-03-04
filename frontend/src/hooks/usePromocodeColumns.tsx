import type {ColumnDef} from '@tanstack/react-table';
import {format} from 'date-fns';
import {Pencil, PowerOff} from 'lucide-react';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import type {PromocodeAnalytics} from '@/types';

interface UsePromocodeColumnsProps {
    onEdit: (id: string) => void;
    onDeactivate: (id: string) => void;
}

export function usePromocodeColumns({onEdit, onDeactivate}: UsePromocodeColumnsProps): ColumnDef<PromocodeAnalytics>[] {
    return [
        {
            accessorKey: 'code',
            header: 'Код',
            enableSorting: true,
            cell: ({row}) => <span className="font-mono font-medium">{row.original.code}</span>,
        },
        {
            accessorKey: 'discount',
            header: 'Скидка',
            enableSorting: true,
            cell: ({row}) => `${row.original.discount}%`,
        },
        {
            accessorKey: 'usage_limit',
            header: 'Лимит',
            enableSorting: false,
            cell: ({row}) => row.original.usage_limit ?? '∞',
        },
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
        {accessorKey: 'total_usages', header: 'Использований', enableSorting: true},
        {
            accessorKey: 'total_revenue',
            header: 'Выручка',
            enableSorting: true,
            cell: ({row}) => `${Number(row.original.total_revenue).toLocaleString()} ₽`,
        },
        {
            accessorKey: 'total_discount_given',
            header: 'Скидок выдано',
            enableSorting: true,
            cell: ({row}) => `${Number(row.original.total_discount_given).toLocaleString()} ₽`,
        },
        {accessorKey: 'unique_users', header: 'Польз.', enableSorting: true},
        {
            accessorKey: 'created_at',
            header: 'Создан',
            enableSorting: true,
            cell: ({row}) => format(new Date(row.original.created_at), 'dd.MM.yyyy'),
        },
        {
            id: 'actions',
            header: '',
            enableSorting: false,
            cell: ({row}) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(row.original.id)}>
                        <Pencil size={14}/>
                    </Button>
                    {row.original.is_active === 1 && (
                        <Button variant="ghost" size="sm" onClick={() => onDeactivate(row.original.id)}>
                            <PowerOff size={14}/>
                        </Button>
                    )}
                </div>
            ),
        },
    ];
}