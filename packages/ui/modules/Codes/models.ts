import { z } from 'zod';

export const codeValueSchema = z
  .string()
  .length(8, 'Код должен содержать 8 символов')
  .regex(/^\w+$/, 'Код должен состоять только из цифр и букв');

export const quantityValueSchema = z
  .number()
  .refine((v) => v > 0 && v < 101, {
    message: 'Введите значение от 1 до 100'
  }
  
  );
  //.regex(/^\d+$/, 'Введите число');

export const codeInputSchema = z.object({
  code: codeValueSchema,
});

export const quantityInputSchema = z.object ({
  quantity: quantityValueSchema,
});

export type CodeInput = z.infer<typeof codeInputSchema>;

export type QuantityInput = z.infer<typeof quantityInputSchema>;


export const codeArrayInputSchema = z.object({
  codes: codeValueSchema.array(),
});
export type CodeArrayInput = z.infer<typeof codeArrayInputSchema>;

export const codeSchema = z.object({
  id: z.number(),
  timesUsed: z.number(),
  value: z.string(),
});
export const quantitySchema = z.object({
  quantity: z.number(), 
})
export type Code = z.infer<typeof codeSchema>;
export type Quantity = z.infer<typeof quantitySchema>;
