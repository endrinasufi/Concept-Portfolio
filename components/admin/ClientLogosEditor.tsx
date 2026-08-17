"use client";

import { MediaImage } from "@/components/branding/MediaImage";
import { uploadMedia, deleteMedia } from "@/lib/media";
import { useSiteSettings } from "@/lib/hooks/useSiteSettings";
import { createId, sortByOrder } from "@/lib/utils/id";
import type { ClientLogo } from "@/types/settings";
import { ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

export function ClientLogosEditor() {
  const { settings, loading, update } = useSiteSettings();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const logos = sortByOrder(settings.clientLogos ?? []);

  async function applyFiles(files: FileList | File[] | null) {
    if (!files?.length) return;
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!images.length) {
      setMessage("Ngarko imazhe (PNG, SVG, WebP, JPG).");
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const startOrder =
        logos.reduce((max, l) => Math.max(max, l.order), -1) + 1;
      const added: ClientLogo[] = [];
      for (let i = 0; i < images.length; i++) {
        const asset = await uploadMedia(images[i]);
        added.push({
          id: createId(),
          mediaId: asset.id,
          order: startOrder + i,
        });
      }
      await update({ clientLogos: [...logos, ...added] });
      setMessage(
        added.length === 1
          ? "Logo u shtua."
          : `${added.length} logo u shtuan.`,
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Gabim në ngarkim");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function removeLogo(logo: ClientLogo) {
    setBusy(true);
    setMessage(null);
    try {
      await update({
        clientLogos: logos.filter((l) => l.id !== logo.id),
      });
      try {
        await deleteMedia(logo.mediaId);
      } catch {
        /* ignore */
      }
      setMessage("Logo u hoq.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-3 rounded-2xl bg-white/70 p-3">
      <div>
        <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted">
          Logo klientësh
        </h2>
        <p className="mt-0.5 text-[11px] text-muted">
          Logot shfaqen poshtë kartave të Web Design në homepage.
        </p>
      </div>

      {logos.length > 0 ? (
        <ul className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
          {logos.map((logo) => (
            <li
              key={logo.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-white p-1.5"
            >
              <MediaImage
                mediaId={logo.mediaId}
                alt="Logo klienti"
                fit="contain"
                className="h-full w-full"
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => void removeLogo(logo)}
                className="absolute right-0.5 top-0.5 inline-flex rounded-full bg-white/90 p-1 opacity-0 transition group-hover:opacity-100 disabled:opacity-50"
                aria-label="Hiq logon"
              >
                <Trash2 size={10} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted">Nuk ka logo klientësh ende.</p>
      )}

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
          void applyFiles(e.dataTransfer.files);
        }}
        className={`relative flex min-h-[4.5rem] cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border-2 border-dashed px-3 py-3 transition ${
          dragging
            ? "border-[#1a1a1a]/45 bg-[#fdd85d]/28"
            : "border-[#1a1a1a]/30 bg-[#fdd85d]/16 hover:border-[#1a1a1a]/42 hover:bg-[#fdd85d]/24"
        } ${busy || loading ? "pointer-events-none opacity-60" : ""}`}
      >
        <ImagePlus className="text-muted" size={18} />
        <p className="text-center text-xs text-foreground/85">
          Drop logo ose kliko
        </p>
        {busy ? <p className="text-[11px] text-muted">Duke ngarkuar…</p> : null}
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="rounded-full bg-foreground px-3 py-1 text-[11px] font-medium text-background disabled:opacity-50"
      >
        Shto logo
      </button>

      {message ? (
        <p className="text-[11px] text-muted">{message}</p>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.svg"
        multiple
        className="hidden"
        onChange={(e) => void applyFiles(e.target.files)}
      />
    </section>
  );
}
