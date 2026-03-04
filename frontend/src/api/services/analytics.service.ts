import type {
    PaginatedResponse, AnalyticsQuery,
    UserAnalytics, PromocodeAnalytics, PromoUsage,
} from '@/types';
import {privateApi} from "@/api/client.ts";

export const analyticsService = {
    getUsers: (query: AnalyticsQuery) =>
        privateApi.get<PaginatedResponse<UserAnalytics>>('/analytics/users', { params: query }).then(r => r.data),

    getPromocodes: (query: AnalyticsQuery) =>
        privateApi.get<PaginatedResponse<PromocodeAnalytics>>('/analytics/promocodes', { params: query }).then(r => r.data),

    getPromoUsages: (query: AnalyticsQuery) =>
        privateApi.get<PaginatedResponse<PromoUsage>>('/analytics/promo-usages', { params: query }).then(r => r.data),
};