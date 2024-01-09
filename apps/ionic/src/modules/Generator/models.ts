import { z } from 'zod';

export const generatorFormSchema = z.object({
  mode: z.enum(['bw', 'color']).default('bw'),
  maxLines: z.number().default(3200 - 1),
  pinCount: z.number().default(240),
  hoopDiameter: z.number().default(0.625),
  lineWeight: z.number().default(20),
  minInterval: z.number().default(20),
  scale: z.number().default(20),
});

export type GeneratorForm = z.infer<typeof generatorFormSchema>;
export type GeneratorMode = GeneratorForm['mode'];

export type Tuple = [number, number];

export type LineResult = {
  lineCacheX: number[][];
  lineCacheY: number[][];
  lineCacheLength: number[];
  lineCacheWeight: number[];
};
