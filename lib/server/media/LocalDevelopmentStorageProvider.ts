import fs from "node:fs/promises";
import path from "node:path";
import type { MediaStorageProvider, StoredObject } from "./MediaStorageProvider";

function safeExt(filename: string, mimeType: string): string {
  const fromName = path.extname(filename).toLowerCase();
  if (fromName && fromName.length <= 8) return fromName;
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/jpeg") return ".jpg";
  if (mimeType === "image/webp") return ".webp";
  if (mimeType === "image/gif") return ".gif";
  if (mimeType === "video/mp4") return ".mp4";
  if (mimeType === "video/webm") return ".webm";
  return ".bin";
}

export class LocalDevelopmentStorageProvider implements MediaStorageProvider {
  private rootDir: string;

  constructor(rootDir?: string) {
    this.rootDir =
      rootDir ||
      process.env.MEDIA_LOCAL_DIR ||
      path.join(process.cwd(), "storage", "uploads");
  }

  async upload(
    buffer: Buffer,
    opts: { filename: string; mimeType: string; id: string },
  ): Promise<StoredObject> {
    await fs.mkdir(this.rootDir, { recursive: true });
    const ext = safeExt(opts.filename, opts.mimeType);
    const providerKey = `${opts.id}${ext}`;
    const fullPath = path.join(/*turbopackIgnore: true*/ this.rootDir, providerKey);
    await fs.writeFile(fullPath, buffer);
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
    const publicUrl = `${siteUrl}/api/media/${encodeURIComponent(opts.id)}`;
    return {
      provider: "local",
      providerKey,
      publicUrl,
    };
  }

  async delete(providerKey: string): Promise<void> {
    const fullPath = path.join(
      /*turbopackIgnore: true*/ this.rootDir,
      path.basename(providerKey),
    );
    try {
      await fs.unlink(fullPath);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code !== "ENOENT") throw err;
    }
  }

  resolvePath(providerKey: string): string {
    return path.join(
      /*turbopackIgnore: true*/ this.rootDir,
      path.basename(providerKey),
    );
  }
}
