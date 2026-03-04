import {useState} from 'react';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'sonner';

import {promocodesService} from '@/api/services/promocodes.service';
import {analyticsService} from '@/api/services/analytics.service';
import {getErrorMessage} from '@/lib/utils';
import {useAnalyticsTable} from '@/hooks/useAnalyticsTable';
import {usePromocodeColumns} from '@/hooks/usePromocodeColumns.tsx';
import type {PromocodeSubmitValues} from '@/components/forms/PromocodeDialog';

export function usePromocodes() {
    const queryClient = useQueryClient();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const invalidate = () =>
        queryClient.invalidateQueries({queryKey: ['analytics', 'promocodes']});

    const deactivateMutation = useMutation({
        mutationFn: (id: string) => promocodesService.deactivate(id),
        onSuccess: () => {
            toast.success('Промокод деактивирован');
            invalidate();
        },
        onError: () => toast.error('Ошибка деактивации'),
    });

    const createMutation = useMutation({
        mutationFn: (values: PromocodeSubmitValues) => promocodesService.create(values),
        onSuccess: () => {
            toast.success('Промокод создан');
            invalidate();
            setDialogOpen(false);
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    });

    const updateMutation = useMutation({
        mutationFn: (values: PromocodeSubmitValues) =>
            promocodesService.update(editingId!, values),
        onSuccess: () => {
            toast.success('Промокод обновлён');
            invalidate();
            setDialogOpen(false);
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    });

    const handleSubmit = (values: PromocodeSubmitValues) => {
        if (editingId) {
            updateMutation.mutate(values);
        } else {
            createMutation.mutate(values);
        }
    };

    const openCreate = () => {
        setEditingId(null);
        setDialogOpen(true);
    };
    const openEdit = (id: string) => {
        setEditingId(id);
        setDialogOpen(true);
    };

    const columns = usePromocodeColumns({
        onEdit: openEdit,
        onDeactivate: deactivateMutation.mutate,
    });

    const table = useAnalyticsTable({
        queryKey: 'promocodes',
        queryFn: analyticsService.getPromocodes,
        columns,
    });

    return {
        table,
        dialog: {
            open: dialogOpen,
            onOpenChange: setDialogOpen,
            editingId,
            onSubmit: handleSubmit,
            isLoading: createMutation.isPending || updateMutation.isPending,
        },
        openCreate,
    };
}