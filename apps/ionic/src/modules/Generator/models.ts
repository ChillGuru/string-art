import { z } from 'zod';

export const generatorFormSchema = z.object({
  type: z.enum(['bw', 'color']).default('bw'),
  maxLines: z.number().default(3500),
  pinCount: z.number().default(240),
  hoopDiameter: z.number().default(0.625),
  lineWeight: z.number().default(20),
  minInterval: z.number().default(20),
  scale: z.number().default(20),
});

export type GeneratorForm = z.infer<typeof generatorFormSchema>;

export type Tuple = [number, number];

export type LineResult = {
  lineCacheX: number[][];
  lineCacheY: number[][];
  lineCacheLength: number[];
  lineCacheWeight: number[];
};
