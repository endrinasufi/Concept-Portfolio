"use client";

import { uploadMedia } from "@/lib/media";
import { useMediaUrl } from "@/lib/hooks/useMediaUrl";
import { Film, Trash2, Upload } from "lucide-react";

export function ProjectVideoEditor({
  videoMediaId,
  onChange,
}: {
  videoMediaId?: string;
  onChange: (videoMediaId: string | undefined) => void;
}) {
  const url = useMediaUrl(videoMediaId);

  async function onFile(file: File | undefined) {
    if (!file) return;
    const asset = await uploadMedia(file);
    onChange(asset.id);
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium">Video (optional)</h3>
        <p className="mt-0.5 text-[11px] text-muted">
          Upload a video — shown at the bottom of the project page.
        </p>
      </div>

      {url ? (
        <div className="overflow-hidden rounded-xl border border-border bg-background">
          <video
            src={url}
            controls
            className="aspect-video w-full bg-black object-contain"
          />
          <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
            <span className="flex items-center gap-1.5 text-[11px] text-muted">
              <Film size={12} /> Video uploaded
            </span>
            <div className="flex gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] hover:bg-surface">
                <Upload size={11} /> Change
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    void onFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => onChange(undefined)}
                className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted hover:bg-surface hover:text-foreground"
              >
                <Trash2 size={11} /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#1a1a1a]/30 bg-[#fdd85d]/16 px-4 py-10 text-[#1a1a1a]/80 transition hover:border-[#1a1a1a]/45 hover:bg-[#fdd85d]/28">
          <Upload size={20} />
          <span className="text-xs font-semibold">Upload video (mp4, webm…)</span>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              void onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}
