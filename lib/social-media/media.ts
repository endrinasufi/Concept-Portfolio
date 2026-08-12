import { getMediaRepository } from "@/lib/repositories";

/** Social Media media helpers — wraps shared media store without changing Branding APIs. */
export async function uploadSocialMediaAsset(
  file: File,
  meta?: { width?: number; height?: number },
) {
  return getMediaRepository().upload(file, {
    filename: file.name,
    width: meta?.width,
    height: meta?.height,
  });
}

export async function deleteSocialMediaAsset(mediaId: string): Promise<void> {
  return getMediaRepository().delete(mediaId);
}

export async function getSocialMediaAssetUrl(
  mediaId: string | undefined | null,
): Promise<string | null> {
  if (!mediaId) return null;
  return getMediaRepository().getUrl(mediaId);
}

export async function resolveSocialMediaSrc(opts: {
  mediaId?: string | null;
  imageUrl?: string | null;
}): Promise<string | null> {
  if (opts.mediaId) {
    const url = await getSocialMediaAssetUrl(opts.mediaId);
    if (url) return url;
  }
  return opts.imageUrl ?? null;
}
