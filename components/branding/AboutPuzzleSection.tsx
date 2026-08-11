"use client";

import type { BrandingProject } from "@/types/branding";
import { MediaImage } from "./MediaImage";

const SLOTS = 3;

function PuzzleTile({
  mediaId,
  className,
  alt,
}: {
  mediaId?: string;
  className?: string;
  alt: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[var(--radius-xl)] bg-surface ${className ?? ""}`}
    >
      {mediaId ? (
        <MediaImage
          mediaId={mediaId}
          alt={alt}
          fit="cover"
          className="transition duration-700 hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 bg-surface-elevated" aria-hidden />
      )}
    </div>
  );
}

export function AboutPuzzleSection({ project }: { project: BrandingProject }) {
  const ids = [...(project.aboutPuzzleMediaIds ?? [])].slice(0, SLOTS);
  while (ids.length < SLOTS) ids.push("");

  const hasText = Boolean(project.shortDescription?.trim());
  const hasPhotos = ids.some(Boolean);
  if (!hasText && !hasPhotos) {
    return <div id="projekt" className="scroll-mt-28" />;
  }

  return (
    <div id="projekt" className="mt-4 scroll-mt-28 md:mt-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-5">
        {/* Left — text block */}
        <div className="flex min-h-[18rem] flex-1 flex-col justify-end overflow-hidden rounded-[var(--radius-xl)] bg-surface-elevated/80 p-7 md:min-h-[22rem] md:p-9 lg:max-w-[42%]">
          {(project.client || project.year) && (
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted">
              {[project.client, project.year].filter(Boolean).join(" · ")}
            </p>
          )}
          <p className="mt-5 text-lg font-light leading-[1.7] tracking-wide text-foreground/80 md:text-xl md:leading-[1.75]">
            {project.shortDescription || "—"}
          </p>
        </div>

        {/* Right — 3-photo puzzle */}
        <div className="grid min-h-[20rem] flex-1 grid-cols-2 grid-rows-2 gap-4 lg:min-h-[22rem]">
          <PuzzleTile
            mediaId={ids[0] || undefined}
            alt={`${project.title} 1`}
            className="col-span-1 row-span-2 min-h-[10rem]"
          />
          <PuzzleTile
            mediaId={ids[1] || undefined}
            alt={`${project.title} 2`}
            className="col-span-1 row-span-1 min-h-[8rem]"
          />
          <PuzzleTile
            mediaId={ids[2] || undefined}
            alt={`${project.title} 3`}
            className="col-span-1 row-span-1 min-h-[8rem]"
          />
        </div>
      </div>
    </div>
  );
}
