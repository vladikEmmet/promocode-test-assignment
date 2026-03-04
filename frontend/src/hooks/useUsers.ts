import {useState} from 'react';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'sonner';

import {analyticsService} from '@/api/services/analytics.service';
import {usersService} from '@/api/services/users.service';
import {getErrorMessage} from '@/lib/utils';
import {useAnalyticsTable} from '@/hooks/useAnalyticsTable';
import {useUserColumns} from '@/hooks/useUserColumns.tsx';
import {useAuth} from '@/hooks/useAuth';
import type {UserAnalytics} from '@/types';

export function useUsers() {
    const queryClient = useQueryClient();
    const {user: currentUser} = useAuth();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserAnalytics | null>(null);

    const invalidate = () =>
        queryClient.invalidateQueries({queryKey: ['analytics', 'users']});

    const deactivateMutation = useMutation({
        mutationFn: (id: string) => usersService.deactivate(id),
        onSuccess: () => {
            toast.success('Пользователь деактивирован');
            invalidate();
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    });

    const updateMutation = useMutation({
        mutationFn: ({id, data}: { id: string; data: { name: string; phone: string } }) =>
            usersService.update(id, data),
        onSuccess: () => {
            toast.success('Пользователь обновлён');
            invalidate();
            setDialogOpen(false);
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    });

    const openEdit = (user: UserAnalytics) => {
        setEditingUser(user);
        setDialogOpen(true);
    };

    const handleSubmit = (data: { name: string; phone: string }) => {
        if (!editingUser) return;
        updateMutation.mutate({id: editingUser.id, data});
    };

    const columns = useUserColumns({
        currentUserEmail: currentUser?.email,
        onEdit: openEdit,
        onDeactivate: deactivateMutation.mutate,
    });

    const table = useAnalyticsTable({
        queryKey: 'users',
        queryFn: analyticsService.getUsers,
        columns,
    });

    return {
        table,
        dialog: {
            open: dialogOpen,
            onOpenChange: setDialogOpen,
            user: editingUser,
            onSubmit: handleSubmit,
            isLoading: updateMutation.isPending,
        },
    };
}