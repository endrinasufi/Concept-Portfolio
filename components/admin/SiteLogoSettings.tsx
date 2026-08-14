"use client";

import { MediaImage } from "@/components/branding/MediaImage";
import { uploadMedia, deleteMedia } from "@/lib/media";
import { useSiteSettings } from "@/lib/hooks/useSiteSettings";
import { ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

export function SiteLogoSettings() {
  const { settings, loading, update } = useSiteSettings();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function applyFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) {
      setMessage("Ngarko një imazh (PNG, SVG, WebP, JPG).");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const prevId = settings.logoMediaId;
      const asset = await uploadMedia(file);
      await update({ logoMediaId: asset.id });
      if (prevId && prevId !== asset.id) {
        try {
          await deleteMedia(prevId);
        } catch {
          /* ignore */
        }
      }
      setMessage("Logo u ruajt.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Gabim në ngarkim");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function clearLogo() {
    setBusy(true);
    setMessage(null);
    try {
      const prevId = settings.logoMediaId;
      await update({ logoMediaId: undefined });
      if (prevId) {
        try {
          await deleteMedia(prevId);
        } catch {
          /* ignore */
        }
      }
      setMessage("Logo u hoq.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="max-w-xl space-y-4 admin-card p-5">
      <div>
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted">
          Logo e headerit
        </h2>
        <p className="mt-1 text-xs text-muted">
          Hiq e lësho imazhin këtu, ose kliko për të zgjedhur. Shfaqet automatikisht në header.
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void applyFile(e.dataTransfer.files?.[0]);
        }}
        className={`relative flex min-h-[9rem] cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-[var(--radius-lg)] border border-dashed px-4 py-6 transition ${
          dragging
            ? "border-accent bg-accent-soft"
            : "border-border bg-background/50 hover:border-white/25"
        } ${busy || loading ? "pointer-events-none opacity-60" : ""}`}
      >
        {settings.logoMediaId ? (
          <MediaImage
            mediaId={settings.logoMediaId}
            alt="Logo e site"
            fit="contain"
            className="max-h-16 max-w-[18rem]"
          />
        ) : (
          <>
            <ImagePlus className="text-muted" size={28} />
            <p className="text-center text-sm text-foreground/85">
              Drop imazhin e logos këtu
            </p>
            <p className="text-center text-xs text-muted">PNG · SVG · WebP · JPG</p>
          </>
        )}

        {busy ? (
          <p className="text-xs text-muted">Duke ngarkuar…</p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background disabled:opacity-50"
        >
          Zgjidh skedar
        </button>
        {settings.logoMediaId ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void clearLogo()}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs disabled:opacity-50"
          >
            <Trash2 size={12} /> Hiq logon
          </button>
        ) : null}
      </div>

      {message ? (
        <p className="rounded-lg border border-border bg-surface px-3 py-2 text-sm">
          {message}
        </p>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.svg"
        className="hidden"
        onChange={(e) => void applyFile(e.target.files?.[0])}
      />
    </section>
  );
}
