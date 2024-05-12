import { z } from 'zod';

export const generatorFormSchema = z.object({
  mode: z.enum(['bw', 'color']).default('bw'),
  maxLines: z.number().default(3500),
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

export type ExportableLayerData = {
  color: string;
  colorRgb: [number, number, number];
  steps: string[];
};

export type AssemblyLayerData = {
  color: string;
  colorRgb: [number, number, number];
  steps: string[];
  currentStep: number;
  layerImgData: Uint8Array;
};

export type GeneratorLayerData = {
  color: string;
  colorRgb: [number, number, number];
  maxLines: number;
  layerImgData: Uint8Array;
};

export const layerColors = ['black', 'cyan', 'yellow', 'magenta'] as const;
export type LayerColor = (typeof layerColors)[number];
