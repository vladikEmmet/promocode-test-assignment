import {useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {useQuery} from '@tanstack/react-query';

import {promocodesService} from '@/api/services/promocodes.service';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

interface FormValues {
    code: string;
    discount: string;
    usageLimit?: string;
    perUserLimit?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface PromocodeSubmitValues {
    code: string;
    discount: number;
    usageLimit?: number;
    perUserLimit?: number;
    dateFrom?: string;
    dateTo?: string;
}

const schema = z.object({
    code: z.string().min(3, 'Минимум 3 символа').max(50, 'Максимум 50 символов'),
    discount: z.string().refine(
        val => !isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 100,
        {message: 'Скидка от 1 до 100%'},
    ),
    usageLimit: z.string().optional(),
    perUserLimit: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
});

interface PromocodeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingId: string | null;
    onSubmit: (values: PromocodeSubmitValues) => void;
    isLoading: boolean;
}

export function PromocodeDialog({
                                    open, onOpenChange, editingId, onSubmit, isLoading,
                                }: PromocodeDialogProps) {
    const isEditing = !!editingId;

    const {data: existing} = useQuery({
        queryKey: ['promocode', editingId],
        queryFn: () => promocodesService.findById(editingId!),
        enabled: !!editingId,
    });

    const {register, handleSubmit, reset, formState: {errors}} =
        useForm<FormValues>({resolver: zodResolver(schema)});

    useEffect(() => {
        if (existing) {
            reset({
                code: existing.code,
                discount: String(existing.discount),
                usageLimit: existing.usageLimit != null ? String(existing.usageLimit) : '',
                perUserLimit: existing.perUserLimit != null ? String(existing.perUserLimit) : '',
                dateFrom: existing.dateFrom ? existing.dateFrom.slice(0, 10) : '',
                dateTo: existing.dateTo ? existing.dateTo.slice(0, 10) : '',
            });
        } else {
            reset({code: '', discount: '10', usageLimit: '', perUserLimit: '', dateFrom: '', dateTo: ''});
        }
    }, [existing, reset, open]);

    const handleFormSubmit = (data: FormValues) => {
        onSubmit({
            code: data.code,
            discount: Number(data.discount),
            usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
            perUserLimit: data.perUserLimit ? Number(data.perUserLimit) : undefined,
            dateFrom: data.dateFrom || undefined,
            dateTo: data.dateTo || undefined,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Редактировать промокод' : 'Создать промокод'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">Код</Label>
                        <Input id="code" placeholder="SUMMER2024" disabled={isEditing} {...register('code')} />
                        {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="discount">Скидка (%)</Label>
                        <Input id="discount" type="number" min={1} max={100} {...register('discount')} />
                        {errors.discount && <p className="text-sm text-red-500">{errors.discount.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="usageLimit">Общий лимит</Label>
                            <Input id="usageLimit" type="number" min={1}
                                   placeholder="Без лимита" {...register('usageLimit')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="perUserLimit">Лимит на польз.</Label>
                            <Input id="perUserLimit" type="number" min={1}
                                   placeholder="Без лимита" {...register('perUserLimit')} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="dateFrom">Дата начала</Label>
                            <Input id="dateFrom" type="date" {...register('dateFrom')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dateTo">Дата окончания</Label>
                            <Input id="dateTo" type="date" {...register('dateTo')} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Отмена
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Создать'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}