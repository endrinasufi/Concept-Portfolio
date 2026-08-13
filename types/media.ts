export type MediaProvider = "local" | "cloudinary" | "indexeddb";

export interface MediaAsset {
  id: string;
  mimeType: string;
  filename: string;
  width?: number;
  height?: number;
  objectPositionX?: number;
  objectPositionY?: number;
  /** Public CDN / app URL when stored on server (MySQL + storage provider). */
  publicUrl?: string;
  provider?: MediaProvider;
  providerKey?: string;
  createdAt: string;
  updatedAt?: string;
}
