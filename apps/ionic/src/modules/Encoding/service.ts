export const EncodingService = {
  async blobToBase64<T extends Blob>(blob: T) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = (e) => {
        reject(e);
      };
      reader.onload = () => {
        const b64 = reader.result as string;
        resolve(b64);
      };
      reader.readAsDataURL(blob);
    });
  },
} as const;
