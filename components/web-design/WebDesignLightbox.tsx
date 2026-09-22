"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useResolvedSrc } from "@/lib/hooks/useMediaUrl";
import type { WebDesignGalleryItem } from "@/types/web-design";

export function WebDesignLightbox({
  items,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  items: WebDesignGalleryItem[];
  index: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const item = index === null ? null : items[index];
  const src = useResolvedSrc({
    mediaId: item?.mediaId,
    imageUrl: item?.imageUrl,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [index, onClose, onPrev, onNext]);

  if (!item || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/92 px-3 pb-6 pt-[calc(var(--header-offset)+0.35rem)] backdrop-blur-md sm:px-6 sm:pb-8 sm:pt-[calc(var(--header-offset)+0.6rem)]"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-[calc(var(--header-offset)+0.35rem)] z-20 rounded-full border border-white/15 bg-black/50 p-2 text-white/80 transition hover:text-white md:right-6"
        aria-label="Close"
      >
        <X size={18} />
      </button>

      {items.length > 1 ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/15 bg-black/50 p-2 text-white/80 transition hover:text-white md:left-6"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/15 bg-black/50 p-2 text-white/80 transition hover:text-white md:right-6"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </>
      ) : null}

      <div
        className="flex max-h-[calc(100svh-var(--header-offset)-3.25rem)] max-w-[min(92vw,72rem)] items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={item.alt || "Screenshot"}
            className="max-h-[calc(100svh-var(--header-offset)-3.25rem)] max-w-full rounded-lg object-contain shadow-[0_20px_80px_rgba(0,0,0,0.55)]"
            style={{
              objectPosition: item.objectPosition ?? "50% 50%",
            }}
            loading="eager"
            decoding="async"
          />
        ) : (
          <div className="h-64 w-96 rounded-lg bg-white/5" aria-hidden />
        )}
      </div>
    </div>,
    document.body,
  );
}
