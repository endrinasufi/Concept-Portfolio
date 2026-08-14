const TARGET_BYTES = 7 * 1024 * 1024;
const HARD_MAX_BYTES = 10 * 1024 * 1024;
const MAX_EDGE = 1600;

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Kompresimi dështoi"))),
      type,
      quality,
    );
  });
}

async function decodeImage(file: File): Promise<HTMLImageElement | ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    /* fall through */
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("decode"));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function sourceSize(src: HTMLImageElement | ImageBitmap): {
  width: number;
  height: number;
} {
  if ("naturalWidth" in src && src.naturalWidth) {
    return { width: src.naturalWidth, height: src.naturalHeight };
  }
  return { width: src.width, height: src.height };
}

/** Zvogëlon foto të mëdha para Cloudinary (limit 10 MB). */
export async function compressImageForUpload(file: File): Promise<File> {
  if (typeof window === "undefined") return file;
  const type = file.type || "";
  if (
    type.startsWith("video/") ||
    type === "image/svg+xml" ||
    type === "image/gif" ||
    type === "image/x-icon" ||
    type === "image/vnd.microsoft.icon"
  ) {
    if (file.size > HARD_MAX_BYTES) {
      throw new Error(
        `"${file.name}" është mbi 10 MB. Cloudinary nuk e pranon — përdor JPG/WebP më të vogël.`,
      );
    }
    return file;
  }

  const looksImage =
    type.startsWith("image/") ||
    /\.(jpe?g|png|webp|gif|jfif|heic|heif)$/i.test(file.name);

  if (!looksImage) return file;

  if (file.size <= TARGET_BYTES) return file;

  let src: HTMLImageElement | ImageBitmap;
  try {
    src = await decodeImage(file);
  } catch {
    if (file.size > HARD_MAX_BYTES || /heic|heif/i.test(file.name + type)) {
      throw new Error(
        `"${file.name}" është shumë e madhe ose format HEIC. Ruaje si JPG nga telefoni dhe ngarko sërish.`,
      );
    }
    return file;
  }

  try {
    let { width, height } = sourceSize(src);
    let edge = Math.max(width, height);
    let scale = Math.min(1, MAX_EDGE / edge);
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      if ("close" in src) src.close();
      if (file.size > HARD_MAX_BYTES) {
        throw new Error(
          `"${file.name}" është mbi 10 MB dhe nuk u kompresua. Ruaje si JPG më të vogël.`,
        );
      }
      return file;
    }

    let quality = 0.82;
    let blob: Blob | null = null;
    for (let attempt = 0; attempt < 6; attempt++) {
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(src as CanvasImageSource, 0, 0, width, height);
      blob = await canvasToBlob(canvas, "image/jpeg", quality);
      if (blob.size <= TARGET_BYTES) break;
      if (quality > 0.55) {
        quality -= 0.1;
      } else {
        width = Math.max(1, Math.round(width * 0.75));
        height = Math.max(1, Math.round(height * 0.75));
        quality = 0.72;
      }
    }

    if ("close" in src) src.close();
    if (!blob || blob.size > HARD_MAX_BYTES) {
      throw new Error(
        `"${file.name}" mbetet mbi 10 MB pas kompresimit. Provo një foto tjetër.`,
      );
    }

    const name = file.name.replace(/\.[^.]+$/i, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch (err) {
    if (err instanceof Error && /mbi 10 MB|HEIC|kompres/.test(err.message)) {
      throw err;
    }
    if (file.size > HARD_MAX_BYTES) {
      throw new Error(
        `"${file.name}" është mbi 10 MB. Ruaje si JPG më të vogël dhe provo sërish.`,
      );
    }
    return file;
  }
}
