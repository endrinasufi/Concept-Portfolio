export interface StoredObject {
  provider: "local" | "cloudinary";
  providerKey: string;
  publicUrl: string;
  width?: number;
  height?: number;
}

export interface MediaStorageProvider {
  upload(
    buffer: Buffer,
    opts: { filename: string; mimeType: string; id: string },
  ): Promise<StoredObject>;
  delete(providerKey: string): Promise<void>;
}
