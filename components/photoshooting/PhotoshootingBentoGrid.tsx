"use client";

import type { PhotoshootingCell } from "@/types/photoshooting";
import { sortByOrder } from "@/lib/utils/id";
import { Reveal } from "@/components/motion/Reveal";
import { useResolvedSrc } from "@/lib/hooks/useMediaUrl";
import {
  PS_COL_CLASS,
  PS_GRID_CLASS,
  PS_ROW_CLASS,
} from "@/lib/photoshooting/gridLayout";

function PhotoCell({
  mediaId,
  imageUrl,
  alt,
}: {
  mediaId?: string;
  imageUrl?: string;
  alt?: string;
}) {
  const src = useResolvedSrc({ mediaId, imageUrl });
  return (
    <div className="relative h-full w-full overflow-hidden bg-surface">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt || ""}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-[1.03]"
          loading="lazy"
        />
      ) : null}
    </div>
  );
}

export function PhotoshootingBentoGrid({ cells }: { cells: PhotoshootingCell[] }) {
  const sorted = sortByOrder(cells).filter((c) => c.type === "photo");

  return (
    <div className={PS_GRID_CLASS}>
      {sorted.map((cell, i) => {
        const col = PS_COL_CLASS[cell.colSpan] ?? PS_COL_CLASS[2];
        const row = PS_ROW_CLASS[cell.rowSpan] ?? PS_ROW_CLASS[1];

        return (
          <Reveal
            key={cell.id}
            delay={Math.min(i * 0.04, 0.28)}
            className={`${col} ${row} h-full overflow-hidden rounded-[1.25rem] md:rounded-[1.5rem]`}
          >
            <PhotoCell
              mediaId={cell.mediaId}
              imageUrl={cell.imageUrl}
              alt={cell.alt}
            />
          </Reveal>
        );
      })}
    </div>
  );
}
