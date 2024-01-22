export const EncodingService = {
  get metadataFlag() {
    return '$stringArtMeta$';
  },

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

  async urlToBlob(url: string) {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return blob;
  },

  appendMetadata<T>(base64DataUrl: string, metadata: T) {
    let [pre, data] = base64DataUrl.split(',');
    pre += ',';
    data = atob(data);
    data += this.metadataFlag + JSON.stringify(metadata);
    data = btoa(data);
    return pre + data;
  },

  /**
   * @throws {Error}
   */
  readMetadata<T>(base64DataUrl: string) {
    const [, data] = base64DataUrl.split(',');
    const decoded = atob(data);
    const [, meta] = decoded.split(this.metadataFlag);
    return JSON.parse(meta) as T;
  },
} as const;
