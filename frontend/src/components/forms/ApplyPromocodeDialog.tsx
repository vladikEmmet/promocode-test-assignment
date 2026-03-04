import {UseFormReturn} from 'react-hook-form';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from '@/components/ui/dialog';
import type {ApplyPromocodeForm} from '@/hooks/useOrders';

interface ApplyPromocodeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: UseFormReturn<ApplyPromocodeForm>;
    onSubmit: (data: ApplyPromocodeForm) => void;
    isPending: boolean;
}

export function ApplyPromocodeDialog({open, onOpenChange, form, onSubmit, isPending}: ApplyPromocodeDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Применить промокод</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">Код промокода</Label>
                        <Input
                            id="code"
                            placeholder="SUMMER2024"
                            {...form.register('code')}
                        />
                        {form.formState.errors.code && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.code.message}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Отмена
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Применение...' : 'Применить'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}