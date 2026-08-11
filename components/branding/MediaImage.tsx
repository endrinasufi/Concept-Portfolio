"use client";

import { useResolvedSrc } from "@/lib/hooks/useMediaUrl";

type Props = {
  mediaId?: string | null;
  imageUrl?: string | null;
  alt?: string;
  className?: string;
  objectPosition?: string;
  /** cover = mbush të gjithë kutizën; contain = brenda konturave (logo) */
  fit?: "cover" | "contain";
};

export function MediaImage({
  mediaId,
  imageUrl,
  alt = "",
  className,
  objectPosition = "50% 50%",
  fit,
}: Props) {
  const src = useResolvedSrc({ mediaId, imageUrl });

  const fitClass =
    fit === "cover"
      ? "absolute inset-0 h-full w-full max-w-none object-cover"
      : fit === "contain"
        ? "max-h-full max-w-full w-auto h-auto object-contain"
        : "";

  if (!src) {
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
      src={src}
      alt={alt}
      className={`${fitClass} ${className ?? ""}`.trim()}
      style={{ objectPosition }}
      loading="lazy"
      decoding="async"
    />
  );
}
