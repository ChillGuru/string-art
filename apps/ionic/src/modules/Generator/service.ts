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
};
