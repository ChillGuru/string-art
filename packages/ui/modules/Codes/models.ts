import { z } from 'zod';

export const codeValueSchema = z
  .string()
  .length(8, 'Код должен содержать 8 символов')
  .regex(/^\w+$/, 'Код должен состоять только из цифр и букв');

export const codeInputSchema = z.object({
  code: codeValueSchema,
});
export type CodeInput = z.infer<typeof codeInputSchema>;

export const codeArrayInputSchema = z.object({
  codes: codeValueSchema.array(),
});
export type CodeArrayInput = z.infer<typeof codeArrayInputSchema>;

export const codeSchema = z.object({
  id: z.number(),
  timesUsed: z.number(),
  value: z.string(),
});
export type Code = z.infer<typeof codeSchema>;
