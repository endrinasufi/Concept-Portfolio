/** Nxjerr ID-në e YouTube nga URL ose nga vetë ID-ja. */
export function extractYoutubeId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  if (/^[\w-]{11}$/.test(raw)) return raw;

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const url = new URL(withProtocol);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    const isYoutubeHost =
      host === "youtube.com" ||
      host.endsWith(".youtube.com") ||
      host === "youtube-nocookie.com" ||
      host.endsWith(".youtube-nocookie.com");
    if (isYoutubeHost) {
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

export function youtubeThumbnailUrl(youtubeId: string, quality: "hq" | "mq" | "sd" | "max" = "max") {
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

/** Burime nga më e larta te më e ulëta — oar2 është vertikale HQ për Shorts. */
export function youtubeThumbSources(youtubeId: string): string[] {
  return [
    `https://i.ytimg.com/vi/${youtubeId}/oar2.jpg`,
    `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${youtubeId}/hq720.jpg`,
    `https://i.ytimg.com/vi/${youtubeId}/sddefault.jpg`,
    `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
  ];
}

export function youtubeThumbSourcesFromInput(
  input?: string | null,
): string[] {
  const id = extractYoutubeId(input ?? "");
  return id ? youtubeThumbSources(id) : [];
}

export function youtubeReelThumbProps(reel: {
  thumbnailMediaId?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
}): { imageUrl?: string; fallbackSrcs?: string[] } {
  if (reel.thumbnailMediaId) {
    return { imageUrl: reel.thumbnailUrl };
  }
  const sources = youtubeThumbSourcesFromInput(
    reel.videoUrl || reel.thumbnailUrl,
  );
  if (sources.length) {
    return { imageUrl: sources[0], fallbackSrcs: sources.slice(1) };
  }
  return { imageUrl: reel.thumbnailUrl };
}

export function youtubeEmbedUrl(
  youtubeId: string,
  opts?: {
    autoplay?: boolean;
    controls?: boolean;
    loop?: boolean;
    mute?: boolean;
    enableJsApi?: boolean;
  },
) {
  const autoplay = opts?.autoplay !== false;
  const controls = opts?.controls !== false;
  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    iv_load_policy: "3",
    cc_load_policy: "0",
    controls: controls ? "1" : "0",
    fs: controls ? "1" : "0",
    disablekb: controls ? "0" : "1",
    autohide: "1",
    showinfo: "0",
  });
  if (opts?.mute || (autoplay && !controls)) params.set("mute", "1");
  if (opts?.loop) {
    params.set("loop", "1");
    params.set("playlist", youtubeId);
  }
  if (opts?.enableJsApi) {
    params.set("enablejsapi", "1");
    if (typeof window !== "undefined") {
      params.set("origin", window.location.origin);
    }
  }
  const host = controls
    ? "https://www.youtube-nocookie.com/embed/"
    : "https://www.youtube.com/embed/";
  return `${host}${youtubeId}?${params.toString()}`;
}

export function isYoutubeThumbnailUrl(url?: string | null): boolean {
  if (!url) return false;
  return /ytimg\.com|img\.youtube\.com/i.test(url);
}

/** Thumbnail nga URL YouTube (watch / shorts / youtu.be) — maxres. */
export function youtubePosterFromUrl(
  input: string | undefined | null,
): string | undefined {
  if (!input) return undefined;
  const id = extractYoutubeId(input);
  return id ? youtubeThumbnailUrl(id, "max") : undefined;
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
