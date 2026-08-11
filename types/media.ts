export interface MediaAsset {
  id: string;
  mimeType: string;
  filename: string;
  width?: number;
  height?: number;
  objectPositionX?: number;
  objectPositionY?: number;
  createdAt: string;
}
