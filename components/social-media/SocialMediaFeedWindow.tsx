"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { SocialMediaFeedPost } from "@/types/social-media";
import { MediaImage } from "@/components/branding/MediaImage";
import { sortByOrder } from "@/lib/utils/id";

const VISIBLE = 9; // 3 cols × 3 rows
const STEP = 3;

export function SocialMediaFeedWindow({
  posts,
  onOpen,
}: {
  posts: SocialMediaFeedPost[];
  onOpen: (post: SocialMediaFeedPost, index: number) => void;
}) {
  const ordered = useMemo(() => sortByOrder(posts ?? []), [posts]);
  const [offset, setOffset] = useState(0);
  const maxOffset = Math.max(0, ordered.length - VISIBLE);
  const safeOffset = Math.min(offset, maxOffset);

  function move(delta: number) {
    setOffset((o) =>
      Math.min(maxOffset, Math.max(0, Math.min(o, maxOffset) + delta)),
    );
  }

  const visible = ordered.slice(safeOffset, safeOffset + VISIBLE);

  if (!ordered.length) {
    return (
      <div className="w-full rounded-lg border border-dashed border-neutral-400/40 bg-neutral-200/30 p-8 text-center text-sm text-neutral-500 lg:ml-auto">
        No posts in the feed yet. Add them from admin.
      </div>
    );
  }

  return (
    <div className="relative w-full lg:ml-auto">
      <div className="grid w-full grid-cols-3 gap-[2px] sm:gap-[3px] md:gap-1.5 lg:gap-2">
        {visible.map((post, i) => {
          const absoluteIndex = safeOffset + i;
          return (
            <button
              key={post.id}
              type="button"
              onClick={() => onOpen(post, absoluteIndex)}
              className="group relative aspect-[4/5] w-full overflow-hidden rounded-[3px] bg-neutral-300/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800/30 sm:rounded-md"
            >
              <MediaImage
                mediaId={post.mediaId}
                imageUrl={post.imageUrl}
                alt={post.alt}
                fit="cover"
                objectPosition={post.objectPosition ?? "50% 50%"}
                className="transition duration-500 ease-out group-hover:scale-[1.05] motion-reduce:group-hover:scale-100"
              />
              <span className="pointer-events-none absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/25 motion-reduce:group-hover:bg-transparent" />
            </button>
          );
        })}
        {visible.length < VISIBLE
          ? Array.from({ length: VISIBLE - visible.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="aspect-[4/5] w-full rounded-sm bg-neutral-200/50 sm:rounded-md"
              />
            ))
          : null}
      </div>

      {ordered.length > VISIBLE ? (
        <>
          <div className="absolute left-full top-1/2 ml-2 hidden -translate-y-1/2 flex-col items-center gap-1.5 md:ml-3 lg:flex">
            <button
              type="button"
              onClick={() => move(-STEP)}
              disabled={safeOffset <= 0}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-900/12 bg-white/60 text-neutral-800 transition hover:border-neutral-900/25 hover:bg-white disabled:opacity-25"
              aria-label="Up"
            >
              <ChevronUp size={14} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => move(STEP)}
              disabled={safeOffset >= maxOffset}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-900/12 bg-white/60 text-neutral-800 transition hover:border-neutral-900/25 hover:bg-white disabled:opacity-25"
              aria-label="Down"
            >
              <ChevronDown size={14} strokeWidth={1.5} />
            </button>
          </div>
          <div className="mt-2 flex justify-end gap-1.5 lg:hidden">
            <button
              type="button"
              onClick={() => move(-STEP)}
              disabled={safeOffset <= 0}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-900/12 bg-white/60 text-neutral-800 transition hover:border-neutral-900/25 hover:bg-white disabled:opacity-25"
              aria-label="Up"
            >
              <ChevronUp size={14} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => move(STEP)}
              disabled={safeOffset >= maxOffset}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-900/12 bg-white/60 text-neutral-800 transition hover:border-neutral-900/25 hover:bg-white disabled:opacity-25"
              aria-label="Down"
            >
              <ChevronDown size={14} strokeWidth={1.5} />
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
