import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
    type PaginationState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DataTableProps<TData> {
    columns: ColumnDef<TData>[];
    data: TData[];
    total: number;
    pagination: PaginationState;
    sorting: SortingState;
    isLoading: boolean;
    onPaginationChange: (pagination: PaginationState) => void;
    onSortingChange: (sorting: SortingState) => void;
}

export function DataTable<TData>({
                                     columns,
                                     data,
                                     total,
                                     pagination,
                                     sorting,
                                     isLoading,
                                     onPaginationChange,
                                     onSortingChange,
                                 }: DataTableProps<TData>) {
    const totalPages = Math.ceil(total / pagination.pageSize);

    const table = useReactTable({
        data,
        columns,
        pageCount: totalPages,
        state: { pagination, sorting },
        manualPagination: true,
        manualSorting: true,
        onPaginationChange: (updater) => {
            const next = typeof updater === 'function' ? updater(pagination) : updater;
            onPaginationChange(next);
        },
        onSortingChange: (updater) => {
            const next = typeof updater === 'function' ? updater(sorting) : updater;
            onSortingChange(next);
        },
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="space-y-4">
            {/* Таблица */}
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : (
                                            <div
                                                className={cn(
                                                    'flex items-center gap-1',
                                                    header.column.getCanSort() && 'cursor-pointer select-none hover:text-slate-900',
                                                )}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getCanSort() && (
                                                    <SortIcon direction={header.column.getIsSorted()} />
                                                )}
                                            </div>
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center text-slate-400">
                                    Загрузка...
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center text-slate-400">
                                    Нет данных
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Пагинация */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>Строк на странице:</span>
                    <Select
                        value={String(pagination.pageSize)}
                        onValueChange={(val) =>
                            onPaginationChange({ pageIndex: 0, pageSize: Number(val) })
                        }
                    >
                        <SelectTrigger className="w-16 h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[10, 20, 50].map(size => (
                                <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <span>Всего: {total}</span>
                </div>

                <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            Страница {pagination.pageIndex + 1} из {totalPages || 1}
          </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPaginationChange({ ...pagination, pageIndex: pagination.pageIndex - 1 })}
                        disabled={pagination.pageIndex === 0 || isLoading}
                    >
                        <ChevronLeft size={16} />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPaginationChange({ ...pagination, pageIndex: pagination.pageIndex + 1 })}
                        disabled={pagination.pageIndex >= totalPages - 1 || isLoading}
                    >
                        <ChevronRight size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
}

function SortIcon({ direction }: { direction: false | 'asc' | 'desc' }) {
    if (direction === 'asc') return <ChevronUp size={14} />;
    if (direction === 'desc') return <ChevronDown size={14} />;
    return <ChevronsUpDown size={14} className="text-slate-300" />;
}

function cn(...classes: (string | undefined | false)[]) {
    return classes.filter(Boolean).join(' ');
}