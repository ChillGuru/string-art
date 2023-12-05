import { z } from 'zod';

export const generatorFormSchema = z.object({
  type: z.enum(['bw', 'color']),
});

export type GeneratorForm = z.infer<typeof generatorFormSchema>;
