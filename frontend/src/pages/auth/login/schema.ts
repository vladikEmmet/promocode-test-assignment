import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email('Неверный формат email'),
    password: z.string().min(8, 'Минимум 8 символов'),
});