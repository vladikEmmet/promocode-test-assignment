import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().email('Неверный формат email'),
    name: z.string().min(2, 'Минимум 2 символа').max(100, 'Максимум 100 символов'),
    phone: z.string().regex(/^\+?[\d\s\-()\d]{7,20}$/, 'Неверный формат телефона'),
    password: z.string().min(8, 'Минимум 8 символов'),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
});