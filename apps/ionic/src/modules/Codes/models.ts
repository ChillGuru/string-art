import { z } from 'zod';

export type Code = {
  id: number;
  timesUsed: number;
  value: string;
};

export const codeFormSchema = z.object({
  code: z
    .string()
    .length(8, 'Код должен содержать 8 символов')
    .regex(/^\d+$/, 'Код должен состоять только из цифер'),
});
export type CodeForm = z.infer<typeof codeFormSchema>;
