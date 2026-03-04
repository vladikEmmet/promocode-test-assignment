import {DataTable} from '@/components/tables/DataTable';
import {TableFilters} from '@/components/tables/TableFilters';
import {UserDialog} from '@/components/forms/UserDialog';
import {useUsers} from '@/hooks/useUsers';

export function UsersPage() {
    const {table, dialog} = useUsers();

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Пользователи</h1>
                <p className="text-slate-500 text-sm">Аналитика по пользователям</p>
            </div>

            <TableFilters
                dateRange={table.dateRange}
                search={table.search}
                searchPlaceholder="Поиск по email или имени..."
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

            <UserDialog {...dialog} />
        </div>
    );
}