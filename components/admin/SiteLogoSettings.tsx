"use client";

import { MediaImage } from "@/components/branding/MediaImage";
import { uploadMedia, deleteMedia } from "@/lib/media";
import { useSiteSettings } from "@/lib/hooks/useSiteSettings";
import type { SiteSettings } from "@/types/settings";
import { ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

type LogoField =
  | "logoMediaId"
  | "logoDarkMediaId"
  | "adminLogoMediaId"
  | "faviconMediaId";

function isAllowedImage(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ["png", "jpg", "jpeg", "webp", "gif", "svg", "ico"].includes(ext);
}

function LogoSlot({
  field,
  title,
  hint,
  emptyLabel,
}: {
  field: LogoField;
  title: string;
  hint: string;
  emptyLabel: string;
}) {
  const { settings, loading, update } = useSiteSettings();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const currentId = settings[field];

  async function applyFile(file: File | undefined) {
    if (!file || !isAllowedImage(file)) {
      setMessage("Ngarko një imazh (PNG, SVG, WebP, JPG ose ICO).");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const prevId = currentId;
      const asset = await uploadMedia(file);
      await update({ [field]: asset.id } as Partial<Omit<SiteSettings, "id">>);
      if (prevId && prevId !== asset.id) {
        try {
          await deleteMedia(prevId);
        } catch {
          /* ignore */
        }
      }
      setMessage(
        field === "faviconMediaId" ? "Favicon u ruajt." : "Logo u ruajt.",
      );
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
      const prevId = currentId;
      await update({ [field]: null } as Partial<Omit<SiteSettings, "id">>);
      if (prevId) {
        try {
          await deleteMedia(prevId);
        } catch {
          /* ignore */
        }
      }
      setMessage(
        field === "faviconMediaId" ? "Favicon u hoq." : "Logo u hoq.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-2.5 rounded-2xl bg-white/70 p-3">
      <div>
        <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted">
          {title}
        </h2>
        <p className="mt-0.5 text-[11px] text-muted">{hint}</p>
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
        className={`relative flex min-h-[5.5rem] cursor-pointer flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border-2 border-dashed px-3 py-3 transition ${
          dragging
            ? "border-[#1a1a1a]/45 bg-[#fdd85d]/28"
            : "border-[#1a1a1a]/30 bg-[#fdd85d]/16 hover:border-[#1a1a1a]/42 hover:bg-[#fdd85d]/24"
        } ${busy || loading ? "pointer-events-none opacity-60" : ""}`}
      >
        {currentId ? (
          <MediaImage
            mediaId={currentId}
            alt={title}
            fit="contain"
            className="max-h-10 max-w-[10rem]"
          />
        ) : (
          <>
            <ImagePlus className="text-muted" size={18} />
            <p className="text-center text-xs text-foreground/85">{emptyLabel}</p>
          </>
        )}

        {busy ? <p className="text-[11px] text-muted">Duke ngarkuar…</p> : null}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="rounded-full bg-foreground px-3 py-1 text-[11px] font-medium text-background disabled:opacity-50"
        >
          Zgjidh
        </button>
        {currentId ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void clearLogo()}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px] disabled:opacity-50"
          >
            <Trash2 size={11} /> Hiq
          </button>
        ) : null}
      </div>

      {message ? (
        <p className="text-[11px] text-muted">{message}</p>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.svg,.ico"
        className="hidden"
        onChange={(e) => void applyFile(e.target.files?.[0])}
      />
    </section>
  );
}

export function SiteLogoSettings() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <LogoSlot
        field="logoMediaId"
        title="Logo e faqes (e bardhë)"
        hint="Për faqet me sfond të errët: homepage, branding, video, etj."
        emptyLabel="Drop logon e bardhë këtu"
      />
      <LogoSlot
        field="logoDarkMediaId"
        title="Logo e faqes (e zezë)"
        hint="Për faqet me sfond të bardhë, p.sh. projektet e Social Media."
        emptyLabel="Drop logon e zezë këtu"
      />
      <LogoSlot
        field="adminLogoMediaId"
        title="Logo e dashboard-it"
        hint="Shfaqet në sidebar dhe në faqen e login-it të adminit. Nuk ndikon te faqja publike."
        emptyLabel="Drop logon e dashboard-it këtu"
      />
      <LogoSlot
        field="faviconMediaId"
        title="Favicon"
        hint="Ikona e tab-it në shfletues. PNG, SVG ose ICO, 32×32 ose 64×64."
        emptyLabel="Drop favicon këtu"
      />
    </div>
  );
}
