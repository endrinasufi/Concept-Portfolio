"use client";

import { MediaImage } from "@/components/branding/MediaImage";
import { uploadMedia } from "@/lib/media";
import { ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

const SLOT_LABELS = ["1 — e gjatë", "2 — sipër", "3 — poshtë"];

function PuzzleSlot({
  label,
  mediaId,
  className,
  onUpload,
  onClear,
}: {
  label: string;
  mediaId?: string;
  className?: string;
  onUpload: (file: File) => Promise<void>;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      await onUpload(file);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-[var(--radius-xl)] ${
        mediaId ? "bg-surface-elevated" : "admin-upload-empty"
      } ${className ?? ""}`}
    >
      {mediaId ? (
        <MediaImage mediaId={mediaId} alt={label} fit="cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-2 text-center">
          <ImagePlus className="text-muted" size={18} />
          <p className="text-[10px] text-muted">{label}</p>
        </div>
      )}

      <div className="absolute inset-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/55 via-transparent to-transparent p-2 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-medium text-black disabled:opacity-50"
        >
          {busy ? "…" : mediaId ? "Ndrysho" : "Ngarko"}
        </button>
        {mediaId ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-full bg-black/70 p-1.5 text-white"
            aria-label={`Hiq ${label}`}
          >
            <Trash2 size={12} />
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void pick(e.target.files?.[0])}
      />
    </div>
  );
}

export function AboutPuzzleEditor({
  mediaIds = [],
  onChange,
}: {
  mediaIds?: string[];
  onChange: (ids: string[]) => void;
}) {
  const ids = Array.from({ length: 3 }, (_, i) => mediaIds[i] ?? "");

  async function handleUpload(index: number, file: File) {
    const asset = await uploadMedia(file);
    onChange(ids.map((id, i) => (i === index ? asset.id : id)));
  }

  function clearAt(index: number) {
    onChange(ids.map((id, i) => (i === index ? "" : id)));
  }

  return (
    <div>
      <div className="mb-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted">
          Puzzle (tekst + 3 foto)
        </h2>
        <p className="mt-1 text-xs text-muted">
          Kolona djathtas e seksionit poshtë hero. Teksti vjen nga përshkrimi i shkurtër.
        </p>
      </div>

      <div className="grid min-h-[12rem] grid-cols-2 grid-rows-2 gap-3">
        <PuzzleSlot
          label={SLOT_LABELS[0]}
          mediaId={ids[0] || undefined}
          className="row-span-2 min-h-[9rem]"
          onUpload={(file) => handleUpload(0, file)}
          onClear={() => clearAt(0)}
        />
        <PuzzleSlot
          label={SLOT_LABELS[1]}
          mediaId={ids[1] || undefined}
          className="min-h-[5.5rem]"
          onUpload={(file) => handleUpload(1, file)}
          onClear={() => clearAt(1)}
        />
        <PuzzleSlot
          label={SLOT_LABELS[2]}
          mediaId={ids[2] || undefined}
          className="min-h-[5.5rem]"
          onUpload={(file) => handleUpload(2, file)}
          onClear={() => clearAt(2)}
        />
      </div>
    </div>
  );
}
