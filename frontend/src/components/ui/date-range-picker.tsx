import { useState } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const PRESETS = [
    { label: 'Сегодня', getDates: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }) },
    { label: '7 дней', getDates: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
    { label: '30 дней', getDates: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
];

interface DateRangePickerProps {
    value: DateRange | undefined;
    onChange: (range: DateRange | undefined) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        'w-72 justify-start text-left font-normal',
                        !value && 'text-slate-400',
                    )}
                >
                    <CalendarIcon size={16} className="mr-2" />
                    {value?.from ? (
                        value.to ? (
                            `${format(value.from, 'dd.MM.yyyy')} — ${format(value.to, 'dd.MM.yyyy')}`
                        ) : (
                            format(value.from, 'dd.MM.yyyy')
                        )
                    ) : (
                        'Выберите период'
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
                {/* Пресеты */}
                <div className="flex gap-2 p-3 border-b">
                    {PRESETS.map(preset => (
                        <Button
                            key={preset.label}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                onChange(preset.getDates());
                                setOpen(false);
                            }}
                        >
                            {preset.label}
                        </Button>
                    ))}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onChange(undefined)}
                    >
                        Сбросить
                    </Button>
                </div>

                <Calendar
                    mode="range"
                    selected={value}
                    onSelect={onChange}
                    numberOfMonths={2}
                />
            </PopoverContent>
        </Popover>
    );
}