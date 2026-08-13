import { v2 as cloudinary } from "cloudinary";
import type { MediaStorageProvider, StoredObject } from "./MediaStorageProvider";

function ensureConfigured() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error("Cloudinary env vars are not configured");
  }
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
}

export class CloudinaryStorageProvider implements MediaStorageProvider {
  async upload(
    buffer: Buffer,
    opts: { filename: string; mimeType: string; id: string },
  ): Promise<StoredObject> {
    ensureConfigured();
    const folder = process.env.CLOUDINARY_FOLDER || "cma-portfolio";
    const resourceType = opts.mimeType.startsWith("video/") ? "video" : "image";

    const result = await new Promise<{
      public_id: string;
      secure_url: string;
      width?: number;
      height?: number;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: opts.id,
          resource_type: resourceType,
          overwrite: true,
        },
        (error, uploaded) => {
          if (error || !uploaded) {
            reject(error || new Error("Cloudinary upload failed"));
            return;
          }
          resolve({
            public_id: uploaded.public_id,
            secure_url: uploaded.secure_url,
            width: uploaded.width,
            height: uploaded.height,
          });
        },
      );
      stream.end(buffer);
    });

    return {
      provider: "cloudinary",
      providerKey: result.public_id,
      publicUrl: result.secure_url,
      width: result.width,
      height: result.height,
    };
  }

  async delete(providerKey: string): Promise<void> {
    ensureConfigured();
    await cloudinary.uploader.destroy(providerKey, { invalidate: true });
  }
}
