import { getMediaRepository } from "@/lib/repositories";

export async function uploadWebDesignAsset(
  file: File,
  meta?: { width?: number; height?: number },
) {
  return getMediaRepository().upload(file, {
    filename: file.name,
    width: meta?.width,
    height: meta?.height,
  });
}
