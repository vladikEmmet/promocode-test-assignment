import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Input } from '@/components/ui/input';
import type { DateRange } from 'react-day-picker';

interface TableFiltersProps {
    dateRange: DateRange | undefined;
    search: string;
    searchPlaceholder?: string;
    onDateChange: (range: DateRange | undefined) => void;
    onSearchChange: (value: string) => void;
    children?: React.ReactNode; // для кнопок типа "Создать"
}

export function TableFilters({
         dateRange,
         search,
         searchPlaceholder = 'Поиск...',
         onDateChange,
         onSearchChange,
         children,
     }: TableFiltersProps) {
        return (
            <div className="flex gap-3 flex-wrap items-center">
                <DateRangePicker value={dateRange} onChange={onDateChange} />
                <Input
                    placeholder={searchPlaceholder}
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                    className="w-72"
                />
                {children}
            </div>
        );
}