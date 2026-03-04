import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { ProtectedRoute } from '@/components/layout/routes/ProtectedRoute.tsx';
import { LoginPage } from '@/pages/auth/login/LoginPage.tsx';
import { RegisterPage } from '@/pages/auth/register/RegisterPage';
import {PublicRoute} from "@/components/layout/routes/PublicRoute.tsx";
import {DashboardLayout} from "@/components/layout/DashboardLayout.tsx";
import {UsersPage} from "@/pages/dashboard/UsersPage.tsx";
import {PromocodesPage} from "@/pages/dashboard/PromocodesPage.tsx";
import {OrdersPage} from "@/pages/dashboard/OrdersPage.tsx";
import {PromoUsagesPage} from "@/pages/dashboard/PromoUsagesPage.tsx";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 30_000, // 30 секунд — совпадает с TTL кэша на бэкенде
        },
    },
});

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    {/* Public pages */}
                    <Route element={<PublicRoute />}>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                    </Route>

                     {/*Private pages*/}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<DashboardLayout />}>
                            <Route path="/dashboard" element={<Navigate to="/dashboard/users" replace />} />
                            <Route path="/dashboard/users" element={<UsersPage />} />
                            <Route path="/dashboard/promocodes" element={<PromocodesPage />} />
                            <Route path="/dashboard/orders" element={<OrdersPage />} />
                            <Route path="/dashboard/promo-usages" element={<PromoUsagesPage />} />
                        </Route>
                        <Route element={<h1>Authorized</h1>} />
                    </Route>

                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
            <Toaster richColors position="top-right" />
        </QueryClientProvider>
    );
}