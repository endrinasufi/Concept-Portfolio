"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SocialMediaStory } from "@/types/social-media";
import { socialMediaContentClass } from "@/lib/social-media/layout";
import { MediaImage } from "@/components/branding/MediaImage";
import { sortByOrder } from "@/lib/utils/id";

export function SocialMediaBlock3({
  stories,
  onOpen,
}: {
  stories: SocialMediaStory[];
  onOpen: (story: SocialMediaStory) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const ordered = sortByOrder(stories);

  function scrollBy(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-story-card]");
    const amount = card ? (card.offsetWidth + 16) * 2 : el.clientWidth * 0.5;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  if (!ordered.length) return null;

  return (
    <section className="relative z-10 pb-16 pt-10 md:pb-20 md:pt-14 lg:pt-16">
      <div className={socialMediaContentClass}>
        <div className="mb-5 flex items-end justify-between gap-4 md:mb-6">
          <h2 className="font-page-title text-[clamp(1.5rem,2.2vw,2.75rem)] text-neutral-950">
            Stories
          </h2>
          {ordered.length > 5 ? (
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-900/15 bg-white/50 text-neutral-800 transition hover:bg-white"
                aria-label="Previous stories"
              >
                <ChevronLeft size={14} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-900/15 bg-white/50 text-neutral-800 transition hover:bg-white"
                aria-label="Next stories"
              >
                <ChevronRight size={14} strokeWidth={1.5} />
              </button>
            </div>
          ) : null}
        </div>

        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden"
        >
          {ordered.map((story) => (
            <button
              key={story.id}
              type="button"
              data-story-card
              onClick={() => onOpen(story)}
              className="group relative w-[calc((100%-0.75rem)/2)] shrink-0 snap-start overflow-hidden rounded-[1.25rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800/30 sm:w-[calc((100%-1rem)/3)] md:w-[calc((100%-4rem)/5)]"
            >
              <div className="relative aspect-[9/16] overflow-hidden">
                <MediaImage
                  mediaId={story.mediaId}
                  imageUrl={story.imageUrl}
                  alt={story.alt}
                  fit="cover"
                  className="transition duration-500 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
