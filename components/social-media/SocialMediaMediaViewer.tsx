"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { MediaImage } from "@/components/branding/MediaImage";
import { useResolvedSrc } from "@/lib/hooks/useMediaUrl";

export type SocialMediaViewerItem = {
  type: "image" | "video";
  mediaId?: string;
  imageUrl?: string;
  videoMediaId?: string;
  videoUrl?: string;
  alt?: string;
  title?: string;
};

export function SocialMediaMediaViewer({
  item,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  item: SocialMediaViewerItem | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSrc = useResolvedSrc({
    mediaId: item?.videoMediaId,
    imageUrl: item?.videoUrl,
  });

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev?.();
      if (e.key === "ArrowRight") onNext?.();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [item, onClose, onPrev, onNext]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || item?.type !== "video" || !videoSrc) return;

    el.muted = false;
    const play = () => {
      const attempt = el.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(() => {
          el.muted = true;
          void el.play().catch(() => undefined);
        });
      }
    };

    if (el.readyState >= 2) play();
    else el.addEventListener("loadeddata", play, { once: true });

    return () => {
      el.pause();
    };
  }, [item, videoSrc]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/40 p-2 text-white/80 transition hover:text-white"
        aria-label="Mbyll"
      >
        <X size={18} />
      </button>

      {hasPrev && onPrev ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-black/40 p-2 text-white/80 transition hover:text-white md:left-6"
          aria-label="Previous"
        >
          <ChevronLeft size={20} />
        </button>
      ) : null}

      {hasNext && onNext ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-black/40 p-2 text-white/80 transition hover:text-white md:right-6"
          aria-label="Next"
        >
          <ChevronRight size={20} />
        </button>
      ) : null}

      <div
        className="flex max-h-[90vh] w-auto max-w-[min(90vw,32rem)] flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === "video" && videoSrc ? (
          <video
            key={videoSrc}
            ref={videoRef}
            src={videoSrc}
            controls
            autoPlay
            playsInline
            className="max-h-[85vh] max-w-full rounded-2xl object-contain"
          />
        ) : (
          <MediaImage
            mediaId={item.mediaId}
            imageUrl={item.imageUrl}
            alt={item.alt ?? ""}
            fit="contain"
            className="max-h-[85vh] max-w-full rounded-2xl"
          />
        )}
        {item.title ? (
          <p className="mt-3 max-w-full text-center text-sm text-white/70">
            {item.title}
          </p>
        ) : null}
      </div>
    </div>
  );
}
