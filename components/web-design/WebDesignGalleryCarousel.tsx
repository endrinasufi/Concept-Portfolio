"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { WebDesignGalleryItem } from "@/types/web-design";
import { WEB_DESIGN_GALLERY_FRAMES } from "@/types/web-design";
import { MediaImage } from "@/components/branding/MediaImage";
import { sortByOrder } from "@/lib/utils/id";

function galleryType(value: string): "desktop" | "mobile" {
  return value === "mobile" ? "mobile" : "desktop";
}

export function WebDesignGalleryCarousel({
  items,
  onOpen,
}: {
  items: WebDesignGalleryItem[];
  onOpen: (index: number) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, scroll: 0, moved: false });
  const ordered = sortByOrder(items);

  function scrollBy(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-wd-card]");
    const amount = card ? card.offsetWidth + 16 : el.clientWidth * 0.55;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  if (!ordered.length) return null;

  return (
    <section className="relative">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory items-end gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden"
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          const el = scrollerRef.current;
          if (!el) return;
          drag.current = {
            active: true,
            startX: e.clientX,
            scroll: el.scrollLeft,
            moved: false,
          };
        }}
        onPointerMove={(e) => {
          if (!drag.current.active) return;
          const el = scrollerRef.current;
          if (!el) return;
          const dx = e.clientX - drag.current.startX;
          if (Math.abs(dx) > 8) {
            if (!drag.current.moved) {
              el.setPointerCapture(e.pointerId);
              drag.current.moved = true;
            }
            el.scrollLeft = drag.current.scroll - dx;
          }
        }}
        onPointerUp={() => {
          drag.current.active = false;
        }}
        onPointerCancel={() => {
          drag.current.active = false;
          drag.current.moved = false;
        }}
      >
        {ordered.map((item, i) => {
          const type = galleryType(item.displayType);
          const frame = WEB_DESIGN_GALLERY_FRAMES[type];
          return (
            <button
              key={item.id}
              type="button"
              data-wd-card
              onClick={() => {
                if (drag.current.moved) {
                  drag.current.moved = false;
                  return;
                }
                onOpen(i);
              }}
              className={`group relative h-[min(68vw,22rem)] shrink-0 cursor-pointer snap-start overflow-hidden rounded-xl bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${frame.aspectClass}`}
              style={{ aspectRatio: frame.aspect }}
              aria-label={`Open ${item.alt || "screenshot"}`}
            >
              <MediaImage
                mediaId={item.mediaId}
                imageUrl={item.imageUrl}
                alt={item.alt}
                fit="cover"
                objectPosition={item.objectPosition ?? "50% 50%"}
                className="transition duration-500 group-hover:scale-[1.02] motion-reduce:group-hover:scale-100"
              />
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white/75 transition hover:bg-white/10 hover:text-white"
          aria-label="Previous screenshots"
        >
          <ChevronLeft size={14} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white/75 transition hover:bg-white/10 hover:text-white"
          aria-label="Next screenshots"
        >
          <ChevronRight size={14} strokeWidth={1.5} />
        </button>
      </div>
    </section>
  );
}
