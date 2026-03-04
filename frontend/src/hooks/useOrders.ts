import {useState} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {toast} from 'sonner';

import {ordersService} from '@/api/services/orders.service';
import {getErrorMessage} from '@/lib/utils';

const createOrderSchema = z.object({
    amount: z.string().refine(
        val => !isNaN(Number(val)) && Number(val) >= 1,
        {message: 'Сумма должна быть больше 0'},
    ),
});

const applyPromocodeSchema = z.object({
    code: z.string().min(3, 'Минимум 3 символа').toUpperCase(),
});

export type CreateOrderForm = z.infer<typeof createOrderSchema>;
export type ApplyPromocodeForm = z.infer<typeof applyPromocodeSchema>;

export function useOrders() {
    const queryClient = useQueryClient();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [applyDialogOpen, setApplyDialogOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    const {data: orders, isLoading} = useQuery({
        queryKey: ['orders', 'my'],
        queryFn: ordersService.findMy,
    });

    const createForm = useForm<CreateOrderForm>({
        resolver: zodResolver(createOrderSchema),
        defaultValues: {amount: undefined},
    });

    const applyForm = useForm<ApplyPromocodeForm>({
        resolver: zodResolver(applyPromocodeSchema),
        defaultValues: {code: ''},
    });

    const invalidateOrders = () => {
        queryClient.invalidateQueries({queryKey: ['orders', 'my']});
        queryClient.invalidateQueries({queryKey: ['analytics']});
    };

    const createMutation = useMutation({
        mutationFn: (amount: number) => ordersService.create(amount),
        onSuccess: () => {
            toast.success('Заказ создан');
            invalidateOrders();
            setCreateDialogOpen(false);
            createForm.reset();
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    });

    const applyMutation = useMutation({
        mutationFn: ({orderId, code}: { orderId: string; code: string }) =>
            ordersService.applyPromocode(orderId, code),
        onSuccess: () => {
            toast.success('Промокод применён');
            invalidateOrders();
            setApplyDialogOpen(false);
            applyForm.reset();
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    });

    const openCreateDialog = () => {
        createForm.reset();
        setCreateDialogOpen(true);
    };

    const openApplyDialog = (orderId: string) => {
        setSelectedOrderId(orderId);
        applyForm.reset();
        setApplyDialogOpen(true);
    };

    const handleCreateSubmit = (data: CreateOrderForm) =>
        createMutation.mutate(Number(data.amount));

    const handleApplySubmit = (data: ApplyPromocodeForm) => {
        if (!selectedOrderId) return;
        applyMutation.mutate({orderId: selectedOrderId, code: data.code});
    };

    return {
        orders,
        isLoading,
        openCreateDialog,
        openApplyDialog,
        createDialog: {
            open: createDialogOpen,
            onOpenChange: setCreateDialogOpen,
            form: createForm,
            onSubmit: handleCreateSubmit,
            isPending: createMutation.isPending,
        },
        applyDialog: {
            open: applyDialogOpen,
            onOpenChange: setApplyDialogOpen,
            form: applyForm,
            onSubmit: handleApplySubmit,
            isPending: applyMutation.isPending,
        },
    };
}