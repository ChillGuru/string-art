import { NdArray } from '@d4c/numjs';

import { GeneratorMode, LineResult, Tuple } from './models';

const quarterLetters = ['A', 'B', 'C', 'D'];

export const GeneratorService = {
  getGeneratorState(pending: boolean, finished: boolean) {
    if (pending) {
      return 'pending';
    }
    return finished ? 'finished' : 'idle';
  },

  pinToStr(pin: number, maxPins: number): string {
    const pinsInQuarter = Math.floor(maxPins / 4);
    const quarterIdx = Math.floor(pin / pinsInQuarter);
    const pinIdx = (pin % pinsInQuarter) + 1;
    return quarterLetters[quarterIdx] + pinIdx;
  },

  pinToQuarter(pin: string): number {
    return quarterLetters.indexOf(pin[0]);
  },

  getNewObjectUrl<T extends Blob>(current?: string, newFile?: T) {
    if (current) {
      URL.revokeObjectURL(current);
    }
    if (newFile) {
      return URL.createObjectURL(newFile);
    }
    return newFile;
  },

  getImgSize(canvas: HTMLCanvasElement): number {
    return Math.min(500, canvas.clientWidth);
  },

  calculatePinCoords(pinCount: number, imgSize: number) {
    const center = imgSize / 2;
    const radius = imgSize / 2 - 1 / 2;
    const coords: [number, number][] = [];
    let angle: number;
    for (let idx = 0; idx < pinCount; idx++) {
      angle = (2 * Math.PI * idx) / pinCount;
      coords.push([
        Math.floor(center + radius * Math.cos(angle)),
        Math.floor(center + radius * Math.sin(angle)),
      ]);
    }
    return coords;
  },

  calculateLines(
    pinCount: number,
    minInterval: number,
    coords: Tuple[]
  ): LineResult {
    const cacheSize = pinCount ** 2;
    const lineCacheY = new Array<number[]>(cacheSize);
    const lineCacheX = new Array<number[]>(cacheSize);
    const lineCacheLength = new Array<number>(cacheSize).fill(0);
    const lineCacheWeight = new Array<number>(cacheSize).fill(1);

    for (let cur = 0; cur < pinCount; cur++) {
      for (let next = cur + minInterval; next < pinCount; next++) {
        const x0 = coords[cur][0],
          y0 = coords[cur][1],
          x1 = coords[next][0],
          y1 = coords[next][1];
        const dist = Math.floor(Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2));
        const xs = GeneratorService.linspace(x0, x1, dist);
        const ys = GeneratorService.linspace(y0, y1, dist);

        lineCacheY[next * pinCount + cur] = ys;
        lineCacheY[cur * pinCount + next] = ys;

        lineCacheX[next * pinCount + cur] = xs;
        lineCacheX[cur * pinCount + next] = xs;

        lineCacheLength[next * pinCount + cur] = dist;
        lineCacheLength[cur * pinCount + next] = dist;
      }
    }
    return { lineCacheX, lineCacheY, lineCacheLength, lineCacheWeight };
  },

  linspace(start: number, end: number, count?: number): number[] {
    if (count === undefined) {
      count = Math.max(Math.round(end - start) + 1, 1);
    }
    if (count < 2) {
      return count === 1 ? [start] : [];
    }
    const res = new Array<number>(count);
    count--;
    for (let i = count; i >= 0; i--) {
      res[i] = Math.floor((end * i + start * (count - i)) / count);
    }
    return res;
  },

  getLineErr(arr: NdArray, coordsA: number[], coordsB: number[]) {
    const result = new Uint8Array(
      coordsA.map((_, i) => arr.get(coordsA[i], coordsB[i]))
    );
    const sum = result.reduce((prev, cur) => prev + cur, 0);
    return sum;
  },

  createLine(
    arr: NdArray,
    coordsA: number[],
    coordsB: number[],
    lineWeight: number
  ) {
    coordsA.forEach((_, i) => {
      arr.set(coordsA[i], coordsB[i], lineWeight);
    });
    return arr;
  },

  subtractArrays(arrAMut: NdArray, arrB: NdArray) {
    const dataA = arrAMut.selection.data as number[];
    const dataB = arrB.selection.data as number[];
    dataA.forEach((_, i) => {
      dataA[i] -= dataB[i];
      if (dataA[i] < 0) {
        dataA[i] = 0;
      }
      if (dataA[i] > 255) {
        dataA[i] = 255;
      }
    });
    return arrAMut;
  },

  /** @deprecated */
  makeGrayscale(imgPixelsMut: ImageData) {
    const imgData: number[] = [];
    for (let y = 0; y < imgPixelsMut.height; y++) {
      for (let x = 0; x < imgPixelsMut.width; x++) {
        const idx = x * 4 + y * 4 * imgPixelsMut.width;
        let avg =
          imgPixelsMut.data[idx] +
          imgPixelsMut.data[idx + 1] +
          imgPixelsMut.data[idx + 2];
        avg /= 3;
        imgPixelsMut.data[idx] = avg;
        imgPixelsMut.data[idx + 1] = avg;
        imgPixelsMut.data[idx + 2] = avg;
        imgData.push(avg);
      }
    }
    return imgData;
  },

  cropCircle(ctx: CanvasRenderingContext2D, imgSize: number) {
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(imgSize / 2, imgSize / 2, imgSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  },

  getLayersForMode(mode: GeneratorMode) {
    switch (mode) {
      case 'bw': {
        return { layers: [] };
      }
      case 'color': {
        throw new Error('Invalid mode');
      }
      default: {
        throw new Error('Invalid mode');
      }
    }
  },
} as const;
