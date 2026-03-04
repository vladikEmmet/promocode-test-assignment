import {privateApi, publicApi} from '../client';
import type { TokenPair, LoginDto, RegisterDto, User } from '@/types';

export const authService = {
    login: (dto: LoginDto) =>
        publicApi.post<TokenPair>('/auth/login', dto).then(r => r.data),

    register: (dto: RegisterDto) =>
        publicApi.post<TokenPair>('/auth/register', dto).then(r => r.data),

    me: () =>
        privateApi.get<User>('/auth/me').then(r => r.data),
};