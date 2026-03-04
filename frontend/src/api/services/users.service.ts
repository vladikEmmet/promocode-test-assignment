import type { User } from '@/types';
import {privateApi} from "@/api/client.ts";

export const usersService = {
    findAll: () =>
        privateApi.get<User[]>('/users').then(r => r.data),

    findById: (id: string) =>
        privateApi.get<User>(`/users/${id}`).then(r => r.data),

    update: (id: string, dto: Partial<Pick<User, 'name' | 'phone' | 'email'>>) =>
        privateApi.patch<User>(`/users/${id}`, dto).then(r => r.data),

    deactivate: (id: string) =>
        privateApi.delete<User>(`/users/${id}`).then(r => r.data),
};