"use client";

import { MediaImage } from "@/components/branding/MediaImage";
import { ImagePlus, Trash2 } from "lucide-react";

export function WebDesignMediaSlot({
  title,
  mediaId,
  imageUrl,
  width,
  height,
  aspectClass = "aspect-[16/10]",
  boxClassName = "w-full",
  onFile,
  onClear,
}: {
  title: string;
  mediaId?: string;
  imageUrl?: string;
  width: number;
  height: number;
  aspectClass?: string;
  boxClassName?: string;
  onFile: (file: File | undefined) => void;
  onClear?: () => void;
}) {
  const hasMedia = Boolean(mediaId || imageUrl);

  return (
    <label className="block min-w-0 cursor-pointer">
      <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
        {title}
      </span>
      <div
        className={`group relative mt-1.5 flex ${aspectClass} ${boxClassName} flex-col items-center justify-center overflow-hidden rounded-lg border border-[#1a1a1a]/18 bg-white text-center`}
      >
        {hasMedia ? (
          <MediaImage
            mediaId={mediaId}
            imageUrl={imageUrl}
            alt={title}
            fit="cover"
          />
        ) : (
          <>
            <ImagePlus size={16} className="text-[#1a1a1a]/65" />
            <span className="mt-1 text-[11px] font-semibold leading-none text-[#1a1a1a]">
              Ngarko
            </span>
            <span className="mt-1 px-1 text-[10px] leading-tight text-muted">
              {width} × {height}
            </span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {hasMedia && onClear ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClear();
            }}
            className="absolute right-1 top-1 rounded-md border border-red-500/30 bg-white/90 p-1 text-red-500 opacity-0 transition group-hover:opacity-100"
            aria-label={`Hiq ${title}`}
          >
            <Trash2 size={11} />
          </button>
        ) : null}
      </div>
    </label>
  );
}
