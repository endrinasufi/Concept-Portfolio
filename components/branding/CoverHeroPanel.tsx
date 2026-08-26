"use client";

import type { BrandingProject } from "@/types/branding";
import { MediaImage } from "./MediaImage";

type Props = {
  project: BrandingProject;
  coverMediaId?: string;
  coverUrl?: string;
  className?: string;
};

export function CoverHeroPanel({
  project,
  coverMediaId,
  coverUrl,
  className,
}: Props) {
  const headline = (project.coverHeadline || project.title || "").trim();
  const stat1Value = project.coverStat1Value?.trim() || String(project.year);
  const stat1Label = project.coverStat1Label?.trim() || "VITI";
  const stat2Value = project.coverStat2Value?.trim();
  const stat2Label = project.coverStat2Label?.trim();
  const insetId = project.coverInsetMediaId;

  return (
    <div
      className={`relative isolate overflow-hidden rounded-[var(--radius-xl)] bg-surface min-h-[22rem] lg:min-h-[28rem] ${className ?? ""}`}
    >
      <MediaImage
        mediaId={coverMediaId}
        imageUrl={coverUrl}
        alt={project.title}
        fit="cover"
        className="transition duration-700 hover:scale-[1.02]"
      />

      {/* Soft vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/25" />

      {/* Thin white grid overlay — 8×8 */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.55) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.55) 1px, transparent 1px)
          `,
          backgroundSize: "12.5% 12.5%",
          backgroundPosition: "0 0",
        }}
        aria-hidden
      />

      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 p-4 md:p-5 lg:p-6">
        {/* Top-left stat */}
        <div className="col-span-2 row-span-1 flex flex-col justify-start">
          <p className="text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-5xl">
            {stat1Value}
          </p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.22em] text-white/75 md:text-xs">
            {stat1Label}
          </p>
        </div>

        {/* Bottom-left: headline */}
        <div className="col-span-2 row-span-2 row-start-3 flex flex-col justify-end pr-2">
          <h1 className="font-page-title max-w-[14ch] text-[2rem] text-white md:text-5xl lg:text-[3.35rem] xl:text-6xl">
            {headline}
          </h1>
        </div>

        {/* Bottom-right: optional inset + secondary stat */}
        <div className="col-span-2 col-start-3 row-span-2 row-start-3 flex flex-col items-end justify-end gap-2">
          {insetId ? (
            <div className="relative aspect-square w-[42%] min-w-[4.5rem] max-w-[8.5rem] overflow-hidden rounded-md bg-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.35)] ring-1 ring-white/25 md:w-[38%] md:max-w-[9.5rem]">
              <MediaImage mediaId={insetId} alt="" fit="cover" />
            </div>
          ) : null}
          {stat2Value ? (
            <div className="text-right">
              <p className="text-2xl font-semibold tracking-tight text-white md:text-3xl lg:text-4xl">
                {stat2Value}
              </p>
              {stat2Label ? (
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.22em] text-white/75 md:text-xs">
                  {stat2Label}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
