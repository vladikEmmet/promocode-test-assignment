import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import type { UserAnalytics } from '@/types';

const schema = z.object({
    name: z.string().min(2, 'Минимум 2 символа').max(100, 'Максимум 100 символов'),
    phone: z.string().regex(/^\+?[\d\s\-()\d]{7,20}$/, 'Неверный формат телефона'),
});

type FormValues = z.infer<typeof schema>;

interface UserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserAnalytics | null;
    onSubmit: (data: FormValues) => void;
    isLoading: boolean;
}

export function UserDialog({
                               open, onOpenChange, user, onSubmit, isLoading,
                           }: UserDialogProps) {
    const { register, handleSubmit, reset, formState: { errors } } =
        useForm<FormValues>({
            resolver: zodResolver(schema),
        });

    useEffect(() => {
        if (user) {
            reset({ name: user.name, phone: user.phone });
        }
    }, [user, reset, open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Редактировать пользователя</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={user?.email ?? ''} disabled />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Имя</Label>
                        <Input id="name" placeholder="John Doe" {...register('name')} />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Телефон</Label>
                        <Input id="phone" placeholder="+79991234567" {...register('phone')} />
                        {errors.phone && (
                            <p className="text-sm text-red-500">{errors.phone.message}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Отмена
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}