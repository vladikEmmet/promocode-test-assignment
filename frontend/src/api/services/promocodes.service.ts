
import type {CreatePromocodeDto, Promocode} from '@/types';
import {privateApi} from "@/api/client.ts";

export const promocodesService = {
    findAll: () =>
        privateApi.get<Promocode[]>('/promocodes').then(r => r.data),

    findById: (id: string) =>
        privateApi.get<Promocode>(`/promocodes/${id}`).then(r => r.data),

    create: (dto: CreatePromocodeDto) =>
        privateApi.post<Promocode>('/promocodes', dto).then(r => r.data),

    update: (id: string, dto: Partial<CreatePromocodeDto> & { isActive?: boolean }) =>
        privateApi.patch<Promocode>(`/promocodes/${id}`, dto).then(r => r.data),

    deactivate: (id: string) =>
        privateApi.delete<Promocode>(`/promocodes/${id}`).then(r => r.data),
};