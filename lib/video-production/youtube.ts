/** Nxjerr ID-në e YouTube nga URL ose nga vetë ID-ja. */
export function extractYoutubeId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  if (/^[\w-]{11}$/.test(raw)) return raw;

  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      const v = url.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") {
        const id = parts[1];
        return id && /^[\w-]{11}$/.test(id) ? id : null;
      }
    }
  } catch {
    return null;
  }
  return null;
}

/** Shorts / reel URL → prefero orientim vertikal. */
export function isYoutubeShortsUrl(input: string): boolean {
  const raw = input.trim();
  if (!raw) return false;
  try {
    const url = new URL(raw);
    return url.pathname.includes("/shorts/");
  } catch {
    return /youtube\.com\/shorts\//i.test(raw);
  }
}

export function youtubeThumbnailUrl(youtubeId: string, quality: "hq" | "mq" | "sd" | "max" = "hq") {
  const q =
    quality === "max"
      ? "maxresdefault"
      : quality === "sd"
        ? "sddefault"
        : quality === "mq"
          ? "mqdefault"
          : "hqdefault";
  return `https://i.ytimg.com/vi/${youtubeId}/${q}.jpg`;
}

export function youtubeEmbedUrl(youtubeId: string) {
  return `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;
}

export function youtubeWatchUrl(youtubeId: string) {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

/** Lartësi e unifikuar e mediave në rresht (të gjitha kartat njësoj). */
export const VIDEO_ROW_MEDIA_HEIGHT = 280;

/** Gjerësi e kartës sipas orientimit, me të njëjtën lartësi. */
export function videoCardWidth(
  orientation: "landscape" | "portrait",
  height: number = VIDEO_ROW_MEDIA_HEIGHT,
): number {
  return orientation === "portrait"
    ? Math.round((height * 9) / 16)
    : Math.round((height * 16) / 9);
}
