"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MediaImage } from "@/components/branding/MediaImage";

export type SlideshowSlide = {
  id: string;
  title: string;
  service: string;
  status: string;
  href: string;
  mediaId?: string;
  imageUrl?: string;
};

export function ProjectSlideshow({ slides }: { slides: SlideshowSlide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [index, slides.length]);

  if (!slides.length) {
    return <div className="absolute inset-0 bg-white/40" />;
  }

  const slide = slides[index] ?? slides[0];

  return (
    <div className="absolute inset-0 overflow-hidden">
      <Link href={slide.href} className="absolute inset-0 block">
        <MediaImage
          mediaId={slide.mediaId}
          imageUrl={slide.imageUrl}
          alt=""
          fit="cover"
        />
      </Link>

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Para"
            onClick={() =>
              setIndex((i) => (i - 1 + slides.length) % slides.length)
            }
            className="absolute left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1a1a1a] shadow-sm hover:bg-white"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="Tjetra"
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
            className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1a1a1a] shadow-sm hover:bg-white"
          >
            <ChevronRight size={16} />
          </button>
        </>
      ) : null}
    </div>
  );
}
