import {useQuery} from '@tanstack/react-query';
import type {ColumnDef} from '@tanstack/react-table';
import {format} from 'date-fns';

import {analyticsService} from '@/api/services/analytics.service';
import {DataTable} from '@/components/tables/DataTable';
import {TableFilters} from '@/components/tables/TableFilters';
import {useAnalyticsTable} from '@/hooks/useAnalyticsTable';
import type {PromoUsage} from '@/types';

const columns: ColumnDef<PromoUsage>[] = [
    {
        accessorKey: 'promocode_code',
        header: 'Промокод',
        enableSorting: true,
        cell: ({row}) => (
            <span className="font-mono font-medium">{row.original.promocode_code}</span>
        ),
    },
    {
        accessorKey: 'user_email',
        header: 'Email',
        enableSorting: true,
    },
    {
        accessorKey: 'user_name',
        header: 'Имя',
        enableSorting: false,
    },
    {
        accessorKey: 'order_amount',
        header: 'Сумма заказа',
        enableSorting: true,
        cell: ({row}) => `${Number(row.original.order_amount).toLocaleString()} ₽`,
    },
    {
        accessorKey: 'discount_amount',
        header: 'Скидка',
        enableSorting: true,
        cell: ({row}) => `${Number(row.original.discount_amount).toLocaleString()} ₽`,
    },
    {
        accessorKey: 'used_at',
        header: 'Дата',
        enableSorting: true,
        cell: ({row}) => format(new Date(row.original.used_at), 'dd.MM.yyyy HH:mm'),
    },
];

export function PromoUsagesPage() {
    const table = useAnalyticsTable({
        queryKey: 'promo-usages',
        queryFn: analyticsService.getPromoUsages,
        columns,
        defaultSortBy: 'used_at',
    });

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">История использований</h1>
                <p className="text-slate-500 text-sm">Все применения промокодов</p>
            </div>

            <TableFilters
                dateRange={table.dateRange}
                search={table.search}
                searchPlaceholder="Поиск по коду или email..."
                onDateChange={table.onDateChange}
                onSearchChange={table.onSearchChange}
            />

            <DataTable
                columns={table.columns}
                data={table.data}
                total={table.total}
                pagination={table.pagination}
                sorting={table.sorting}
                isLoading={table.isLoading}
                onPaginationChange={table.setPagination}
                onSortingChange={table.onSortingChange}
            />
        </div>
    );
}