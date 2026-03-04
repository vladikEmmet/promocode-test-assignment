import {Plus} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {DataTable} from '@/components/tables/DataTable';
import {TableFilters} from '@/components/tables/TableFilters';
import {PromocodeDialog} from '@/components/forms/PromocodeDialog';
import {usePromocodes} from '@/hooks/usePromocodes';

export function PromocodesPage() {
    const {table, dialog, openCreate} = usePromocodes();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Промокоды</h1>
                </div>
            </div>

            <TableFilters
                dateRange={table.dateRange}
                search={table.search}
                searchPlaceholder="Поиск по коду..."
                onDateChange={table.onDateChange}
                onSearchChange={table.onSearchChange}
            >
                <Button onClick={openCreate}>
                    <Plus size={16} className="mr-2"/>
                    Создать
                </Button>
            </TableFilters>

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

            <PromocodeDialog {...dialog} />
        </div>
    );
}