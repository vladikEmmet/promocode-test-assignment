import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import type { AnalyticsQuery } from '@/types';

export function useTableQuery(defaultSortBy = 'created_at') {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 20,
    });
    const [sorting, setSorting] = useState<SortingState>([
        { id: defaultSortBy, desc: true },
    ]);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [search, setSearch] = useState('');

    const [debouncedSearch] = useDebounce(search, 400);

    const handleDateChange = (range: DateRange | undefined) => {
        setDateRange(range);
        setPagination(p => ({ ...p, pageIndex: 0 }));
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPagination(p => ({ ...p, pageIndex: 0 }));
    };

    const handleSortingChange = (newSorting: SortingState) => {
        setSorting(newSorting);
        setPagination(p => ({ ...p, pageIndex: 0 }));
    };

    const query: AnalyticsQuery = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        sortBy: sorting[0]?.id,
        sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
        dateFrom: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
        dateTo: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
        search: debouncedSearch || undefined, // ← debounced значение в запрос
    };

    return {
        pagination,
        sorting,
        dateRange,
        search,
        query,
        setPagination,
        onSortingChange: handleSortingChange,
        onDateChange: handleDateChange,
        onSearchChange: handleSearchChange,
    };
}