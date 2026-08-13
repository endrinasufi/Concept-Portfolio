import type { MediaStorageProvider } from "./MediaStorageProvider";
import { LocalDevelopmentStorageProvider } from "./LocalDevelopmentStorageProvider";
import { CloudinaryStorageProvider } from "./CloudinaryStorageProvider";

let cached: MediaStorageProvider | null = null;

export function getMediaStorageProvider(): MediaStorageProvider {
  if (cached) return cached;
  const provider = (process.env.MEDIA_STORAGE_PROVIDER || "local").toLowerCase();
  if (provider === "cloudinary") {
    cached = new CloudinaryStorageProvider();
  } else {
    cached = new LocalDevelopmentStorageProvider();
  }
  return cached;
}

export function getLocalStorageProvider(): LocalDevelopmentStorageProvider {
  return new LocalDevelopmentStorageProvider();
}
