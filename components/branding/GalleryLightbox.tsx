"use client";

import type { BrandColor, BrandingProject } from "@/types/branding";
import { MediaImage } from "./MediaImage";
import { getProjectCover } from "@/lib/utils/projectCover";
import { sortByOrder } from "@/lib/utils/id";
import { useResolvedSrc } from "@/lib/hooks/useMediaUrl";
import { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

function LightboxArrowIcon({ dir }: { dir: "prev" | "next" }) {
  const isNext = dir === "next";
  return (
    <svg
      viewBox="0 0 56 56"
      className="h-9 w-9 md:h-10 md:w-10"
      fill="none"
      aria-hidden
    >
      {/* vijë e gjatë + kënd i butë — formë editorial */}
      <path
        d={
          isNext
            ? "M12 28 H38 M28 14 L42 28 L28 42"
            : "M44 28 H18 M28 14 L14 28 L28 42"
        }
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavArrow({
  dir,
  onClick,
}: {
  dir: "prev" | "next";
  onClick: (e: React.MouseEvent) => void;
}) {
  const side = dir === "prev" ? "left-1 md:left-4" : "right-1 md:right-4";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute ${side} z-30 p-2 text-white/45 transition-opacity duration-200 hover:text-white/90 hover:opacity-100`}
      aria-label={dir === "prev" ? "Previous photo" : "Next photo"}
    >
      <LightboxArrowIcon dir={dir} />
    </button>
  );
}

const PILL_INSET =
  "inset 1px 1px 4px rgba(0,0,0,0.4), inset -1px -1px 3px rgba(255,255,255,0.18)";

function MiniPalette({ colors }: { colors: BrandColor[] }) {
  const sorted = sortByOrder(colors);
  if (!sorted.length) return null;

  return (
    <div
      className="flex h-3.5 items-stretch gap-1"
      role="list"
      aria-label="Palette"
    >
      {sorted.map((c) => (
        <span
          key={c.id}
          role="listitem"
          title={c.hex}
          className="block h-full w-3.5 shrink-0 rounded-full"
          style={{ backgroundColor: c.hex, boxShadow: PILL_INSET }}
        />
      ))}
    </div>
  );
}

function BrandSignature({ project }: { project: BrandingProject }) {
  const { logoUrl } = getProjectCover(project);
  const hasLogo = Boolean(project.logoMediaId || logoUrl);
  const hasColors = (project.brandColors?.length ?? 0) > 0;
  if (!hasLogo && !hasColors) return null;

  return (
    <div className="pointer-events-none absolute bottom-5 left-5 z-20 md:bottom-7 md:left-7">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/10 bg-black/35 px-3 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
        {hasLogo ? (
          <div
            className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full"
            style={{
              backgroundColor: project.logoBackgroundColor || "rgba(255,255,255,0.06)",
            }}
          >
            <MediaImage
              mediaId={project.logoMediaId}
              imageUrl={logoUrl}
              alt=""
              fit="contain"
              className="max-h-[62%] max-w-[62%] opacity-95"
            />
          </div>
        ) : null}
        <div className="flex min-w-0 flex-col gap-1.5 pr-1">
          {project.title ? (
            <span className="max-w-[10rem] truncate text-[10px] font-medium tracking-[0.08em] text-white/70">
              {project.title}
            </span>
          ) : null}
          <MiniPalette colors={project.brandColors ?? []} />
        </div>
      </div>
    </div>
  );
}

function LightboxSlide({ mediaId, alt }: { mediaId: string; alt: string }) {
  const src = useResolvedSrc({ mediaId });
  if (!src) {
    return <div className="h-full w-full animate-pulse bg-white/5" />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="max-h-full max-w-full object-contain select-none"
      draggable={false}
    />
  );
}

export function GalleryLightbox({
  project,
  mediaIds,
  index,
  onClose,
  onIndexChange,
}: {
  project: BrandingProject;
  mediaIds: string[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const total = mediaIds.length;
  const current = mediaIds[index];

  const go = useCallback(
    (dir: -1 | 1) => {
      if (total < 1) return;
      onIndexChange((index + dir + total) % total);
    },
    [index, onIndexChange, total],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  if (!mounted || !current) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-label="Gallery"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-30 rounded-full border border-white/10 bg-white/5 p-2 text-white/80 transition hover:bg-white/10 hover:text-white md:right-6 md:top-6"
        aria-label="Close"
      >
        <X size={18} />
      </button>

      <p className="absolute left-1/2 top-5 z-20 -translate-x-1/2 text-[10px] tabular-nums tracking-[0.22em] text-white/35 md:top-7">
        {index + 1} / {total}
      </p>

      {total > 1 ? (
        <>
          <NavArrow
            dir="prev"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
          />
          <NavArrow
            dir="next"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
          />
        </>
      ) : null}

      <div className="relative flex h-[min(86vh,900px)] w-[min(94vw,1180px)] items-center justify-center px-14 md:px-20">
        <div
          className="max-h-full max-w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <LightboxSlide
            key={current}
            mediaId={current}
            alt={`Gallery ${index + 1}`}
          />
        </div>
      </div>

      <BrandSignature project={project} />
    </div>,
    document.body,
  );
}
