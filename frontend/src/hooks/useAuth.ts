import {useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useAuthStore} from '@/store/auth.store';
import {authService} from '@/api/services/auth.service';
import type {LoginDto, RegisterDto} from '@/types';

export function useAuth() {
    const {setTokens, logout: storeLogout, isAuthenticated} = useAuthStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const {data: user} = useQuery({
        queryKey: ['me'],
        queryFn: authService.me,
        enabled: isAuthenticated,
        staleTime: Infinity,
    });

    const login = useCallback(async (dto: LoginDto) => {
        const tokens = await authService.login(dto);
        setTokens(tokens.accessToken, tokens.refreshToken);
        await queryClient.invalidateQueries({queryKey: ['me']});
        navigate('/dashboard');
    }, [setTokens, queryClient, navigate]);

    const register = useCallback(async (dto: RegisterDto) => {
        const tokens = await authService.register(dto);
        setTokens(tokens.accessToken, tokens.refreshToken);
        await queryClient.invalidateQueries({queryKey: ['me']});
        navigate('/dashboard');
    }, [setTokens, queryClient, navigate]);

    const logout = useCallback(() => {
        storeLogout();
        queryClient.clear();
        navigate('/login');
    }, [storeLogout, queryClient, navigate]);

    return {user, isAuthenticated, login, register, logout};
}