import axios from 'axios';
import type { TokenPair } from '@/types/auth.types.ts';
import {useAuthStore} from "@/store/auth.store.ts";

export const publicApi = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

export const privateApi = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

privateApi.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
    failedQueue.forEach((p) => {
        if (token) p.resolve(token);
        else p.reject(error);
    });
    failedQueue = [];
}

function logout() {
    useAuthStore.getState().logout();
    window.location.href = '/login';
}

privateApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: (token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(privateApi(originalRequest));
                    },
                    reject,
                });
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
            logout();
            return Promise.reject(error);
        }

        try {
            const { data } = await publicApi.post<TokenPair>('/auth/refresh', { refreshToken });

            useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);

            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            processQueue(null, data.accessToken);

            return privateApi(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            logout();
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    },
);