import { getMediaRepository } from "@/lib/repositories";

export async function uploadMedia(
  file: File,
  meta?: { width?: number; height?: number },
) {
  return getMediaRepository().upload(file, {
    filename: file.name,
    width: meta?.width,
    height: meta?.height,
  });
}

export async function getMediaUrl(mediaId: string | undefined | null): Promise<string | null> {
  if (!mediaId) return null;
  return getMediaRepository().getUrl(mediaId);
}

export async function deleteMedia(mediaId: string): Promise<void> {
  return getMediaRepository().delete(mediaId);
}

/** Resolve either a mediaId or a direct external URL (seed placeholders). */
export async function resolveImageSrc(opts: {
  mediaId?: string | null;
  imageUrl?: string | null;
}): Promise<string | null> {
  if (opts.mediaId) {
    const url = await getMediaUrl(opts.mediaId);
    if (url) return url;
  }
  return opts.imageUrl ?? null;
}
