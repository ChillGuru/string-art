import { z } from 'zod';

export const loginFormSchema = z.object({
  code: z
    .string()
    .min(9, 'Код не должен быть короче 8 символов')
    .max(9, 'Код не должен быть больше 8 символов'),
});

export type TLoginForm = z.infer<typeof loginFormSchema>;

export type UserRole = 'user' | 'admin';
