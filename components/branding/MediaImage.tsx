"use client";

import { useEffect, useMemo, useState } from "react";
import { useResolvedSrc } from "@/lib/hooks/useMediaUrl";

type Props = {
  mediaId?: string | null;
  imageUrl?: string | null;
  alt?: string;
  className?: string;
  objectPosition?: string;
  /** cover = mbush të gjithë kutizën; contain = brenda konturave (logo) */
  fit?: "cover" | "contain";
  /** URL alternative nëse src dështon ose është thumbnail YouTube e ulët. */
  fallbackSrcs?: string[];
};

export function MediaImage({
  mediaId,
  imageUrl,
  alt = "",
  className,
  objectPosition = "50% 50%",
  fit,
  fallbackSrcs,
}: Props) {
  const src = useResolvedSrc({ mediaId, imageUrl });
  const fallbackKey = (fallbackSrcs ?? []).join("\n");
  const extras = useMemo(
    () => fallbackKey.split("\n").filter((u) => u && u !== src),
    [fallbackKey, src],
  );
  const chain = useMemo(
    () => (src ? [src, ...extras] : extras),
    [src, extras],
  );
  const [failIndex, setFailIndex] = useState(0);

  useEffect(() => {
    setFailIndex(0);
  }, [src, fallbackKey]);

  const current = chain[Math.min(failIndex, Math.max(chain.length - 1, 0))] ?? null;

  function advance() {
    setFailIndex((i) => (i < chain.length - 1 ? i + 1 : i));
  }

  const fitClass =
    fit === "cover"
      ? "absolute inset-0 h-full w-full max-w-none object-cover"
      : fit === "contain"
        ? "max-h-full max-w-full w-auto h-auto object-contain"
        : "";

  if (!current) {
    return (
      <div
        className={`${fit === "cover" ? "absolute inset-0" : ""} bg-surface-elevated ${className ?? ""} ${fitClass}`}
        aria-hidden
        style={fit === "cover" ? undefined : { minHeight: "8rem" }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt}
      className={`${fitClass} ${className ?? ""}`.trim()}
      style={{ objectPosition }}
      loading="lazy"
      decoding="async"
      onError={advance}
      onLoad={(e) => {
        if (failIndex >= chain.length - 1) return;
        if (e.currentTarget.naturalWidth > 0 && e.currentTarget.naturalWidth < 200) {
          advance();
        }
      }}
    />
  );
}
