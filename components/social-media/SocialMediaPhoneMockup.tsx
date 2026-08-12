"use client";

import { MediaImage } from "@/components/branding/MediaImage";

/** iPhone-style device shell — ~9:19.5 screen ratio */
export function SocialMediaPhoneMockup({
  mediaId,
  imageUrl,
  alt,
  className = "",
}: {
  mediaId?: string;
  imageUrl?: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width: "clamp(10rem, 14vw, 15.5rem)" }}
    >
      {/* Device body */}
      <div className="rounded-[1.65rem] bg-neutral-950 p-[5px] shadow-[0_20px_50px_rgba(0,0,0,0.22)] ring-1 ring-black/20 sm:rounded-[1.85rem] sm:p-[6px] md:rounded-[2rem] md:p-[7px]">
        {/* Screen */}
        <div
          className="relative overflow-hidden rounded-[1.25rem] bg-black sm:rounded-[1.4rem] md:rounded-[1.55rem]"
          style={{ aspectRatio: "9 / 19.5" }}
        >
          {/* Dynamic island */}
          <div
            className="pointer-events-none absolute left-1/2 top-[6px] z-10 h-[10px] w-[28%] -translate-x-1/2 rounded-full bg-black/90 sm:top-[7px] sm:h-[11px]"
            aria-hidden
          />
          <MediaImage
            mediaId={mediaId}
            imageUrl={imageUrl}
            alt={alt}
            fit="cover"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
