import { z } from 'zod';

export const generatorFormSchema = z.object({
  type: z.enum(['bw', 'color']),
});

export type GeneratorForm = z.infer<typeof generatorFormSchema>;

export type Tuple = [number, number];
export type LineResult = {
  lineCacheX: number[][];
  lineCacheY: number[][];
  lineCacheLength: number[];
  lineCacheWeight: number[];
};
