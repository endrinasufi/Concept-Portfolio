"use client";

import { useEffect, useState } from "react";
import { getMediaUrl } from "@/lib/media";

export function useMediaUrl(mediaId?: string | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!mediaId) return;
    let cancelled = false;
    void getMediaUrl(mediaId).then((u) => {
      if (!cancelled) setUrl(u);
    });
    return () => {
      cancelled = true;
    };
  }, [mediaId]);

  if (!mediaId) return null;
  return url;
}

export function useResolvedSrc(opts: {
  mediaId?: string | null;
  imageUrl?: string | null;
}): string | null {
  const mediaUrl = useMediaUrl(opts.mediaId);
  return mediaUrl ?? opts.imageUrl ?? null;
}
