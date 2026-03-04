import {UseFormReturn} from 'react-hook-form';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from '@/components/ui/dialog';
import type {CreateOrderForm} from '@/hooks/useOrders';

interface CreateOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: UseFormReturn<CreateOrderForm>;
    onSubmit: (data: CreateOrderForm) => void;
    isPending: boolean;
}

export function CreateOrderDialog({open, onOpenChange, form, onSubmit, isPending}: CreateOrderDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Создать заказ</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Сумма заказа (₽)</Label>
                        <Input
                            id="amount"
                            type="number"
                            min={1}
                            placeholder="1500"
                            {...form.register('amount')}
                        />
                        {form.formState.errors.amount && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.amount.message}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Отмена
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Создание...' : 'Создать'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}