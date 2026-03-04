import {useQuery} from '@tanstack/react-query';
import type {ColumnDef, PaginationState, SortingState} from '@tanstack/react-table';
import type {AnalyticsQuery} from '@/types';
import {useTableQuery} from './useTableQuery';

interface UseAnalyticsTableOptions<TData> {
    queryKey: string;
    queryFn: (query: AnalyticsQuery) => Promise<{ data: TData[]; total: number }>;
    columns: ColumnDef<TData>[];
    defaultSortBy?: string;
}

export function useAnalyticsTable<TData>({
                                             queryKey,
                                             queryFn,
                                             columns,
                                             defaultSortBy = 'created_at',
                                         }: UseAnalyticsTableOptions<TData>) {
    const tableQuery = useTableQuery(defaultSortBy);

    const {data, isLoading} = useQuery({
        queryKey: ['analytics', queryKey, tableQuery.query],
        queryFn: () => queryFn(tableQuery.query),
    });

    return {
        columns,
        data: data?.data ?? [],
        total: data?.total ?? 0,
        isLoading,
        ...tableQuery,
    };
}