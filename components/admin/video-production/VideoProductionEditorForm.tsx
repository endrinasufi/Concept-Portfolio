"use client";

import { useState } from "react";
import type { VideoProductionItem } from "@/types/video-production";
import { normalizeVideoOrientation } from "@/types/video-production";
import {
  extractYoutubeId,
  isYoutubeShortsUrl,
  youtubeThumbnailUrl,
} from "@/lib/video-production/youtube";

type Props = {
  value: Omit<VideoProductionItem, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
  };
  onChange: (
    next: Omit<VideoProductionItem, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
    },
  ) => void;
  onSubmit: (
    next: Omit<VideoProductionItem, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
    },
  ) => Promise<void>;
  submitLabel: string;
};

export function VideoProductionEditorForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
}: Props) {
  const [youtubeInput, setYoutubeInput] = useState(
    value.youtubeId ? `https://www.youtube.com/watch?v=${value.youtubeId}` : "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orientation = normalizeVideoOrientation(value.orientation);
  const isSocial = orientation === "portrait";

  function patch(
    partial: Partial<
      Omit<VideoProductionItem, "id" | "createdAt" | "updatedAt">
    >,
  ) {
    onChange({ ...value, ...partial });
  }

  function onYoutubeBlur() {
    const id = extractYoutubeId(youtubeInput);
    if (id) {
      const next: Partial<
        Omit<VideoProductionItem, "id" | "createdAt" | "updatedAt">
      > = { youtubeId: id };
      if (isYoutubeShortsUrl(youtubeInput)) {
        next.orientation = "portrait";
      }
      patch(next);
      setError(null);
    } else if (youtubeInput.trim()) {
      setError("URL ose ID e YouTube nuk është e vlefshme.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = extractYoutubeId(youtubeInput) ?? value.youtubeId;
    if (!id) {
      setError("Vendos një URL ose ID të vlefshme YouTube.");
      return;
    }
    if (!value.title.trim() || !value.clientName.trim()) {
      setError("Titulli dhe klienti janë të detyrueshëm.");
      return;
    }
    const next = {
      ...value,
      youtubeId: id,
      orientation: normalizeVideoOrientation(value.orientation),
    };
    onChange(next);
    setSaving(true);
    setError(null);
    try {
      await onSubmit(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gabim në ruajtje");
    } finally {
      setSaving(false);
    }
  }

  const thumbId = extractYoutubeId(youtubeInput) ?? value.youtubeId;

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="admin-card space-y-6 p-5">
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em] text-muted">
              Tipi
            </span>
            <select
              className="mt-2 block w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
              value={orientation}
              onChange={(e) =>
                patch({
                  orientation: e.target.value as VideoProductionItem["orientation"],
                })
              }
            >
              <option value="portrait">Social Media (Reel)</option>
              <option value="landscape">Production (Horizontal)</option>
            </select>
            <p className="mt-1.5 text-xs text-muted">
              Social Media = vertikal. Production = horizontal. Nuk është shërbimi
              Social Media i portfolio-s.
            </p>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em] text-muted">
              Titulli
            </span>
            <input
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
              value={value.title}
              onChange={(e) => patch({ title: e.target.value })}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em] text-muted">
              Klienti
            </span>
            <input
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
              value={value.clientName}
              onChange={(e) => patch({ clientName: e.target.value })}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em] text-muted">
              YouTube URL / ID
            </span>
            <input
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
              value={youtubeInput}
              onChange={(e) => setYoutubeInput(e.target.value)}
              onBlur={onYoutubeBlur}
              placeholder="https://www.youtube.com/watch?v=… ose /shorts/…"
              required
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em] text-muted">
              Përshkrim
            </span>
            <textarea
              className="mt-2 min-h-[100px] w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
              value={value.description ?? ""}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-muted">
                Ngjyra aksenti
              </span>
              <input
                type="color"
                className="mt-2 h-10 w-14 cursor-pointer rounded-lg border border-border bg-surface"
                value={value.accentColor}
                onChange={(e) => patch({ accentColor: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-muted">
                Statusi
              </span>
              <select
                className="mt-2 block rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
                value={value.status}
                onChange={(e) =>
                  patch({
                    status: e.target.value as VideoProductionItem["status"],
                  })
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            Thumbnail
          </p>
          <div
            className={`mt-2 overflow-hidden rounded-xl border border-border bg-surface-elevated ${
              isSocial ? "aspect-[9/16] max-w-[180px]" : "aspect-video"
            }`}
          >
            {thumbId ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={youtubeThumbnailUrl(thumbId)}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted">
                Vendos YouTube URL
              </div>
            )}
          </div>
        </div>
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background disabled:opacity-60"
      >
        {saving ? "Duke ruajtur…" : submitLabel}
      </button>
    </form>
  );
}
