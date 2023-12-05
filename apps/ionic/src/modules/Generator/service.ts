export const GeneratorService = {
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
};
