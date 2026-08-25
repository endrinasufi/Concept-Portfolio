"use client";

import type { BrandColor, BrandingProject } from "@/types/branding";
import { MediaImage } from "@/components/branding/MediaImage";
import { CoverHeroPanel } from "@/components/branding/CoverHeroPanel";
import { uploadMedia } from "@/lib/media";
import { contrastingInk, mutedInk } from "@/lib/utils/colorContrast";
import { ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

type MediaSlotKey = "logoMediaId" | "mockupMediaId" | "coverMediaId" | "coverInsetMediaId";
type ColorKey =
  | "logoBackgroundColor"
  | "industryBackgroundColor"
  | "servicesBackgroundColor";
type TextKey =
  | "coverHeadline"
  | "coverStat1Value"
  | "coverStat1Label"
  | "coverStat2Value"
  | "coverStat2Label";

type Props = {
  logoMediaId?: string;
  mockupMediaId?: string;
  coverMediaId?: string;
  coverInsetMediaId?: string;
  logoBackgroundColor?: string;
  industryBackgroundColor?: string;
  servicesBackgroundColor?: string;
  coverHeadline?: string;
  coverStat1Value?: string;
  coverStat1Label?: string;
  coverStat2Value?: string;
  coverStat2Label?: string;
  brandColors?: BrandColor[];
  title?: string;
  client?: string;
  year?: number;
  industry?: string;
  services?: string[];
  onChange: (
    patch: Partial<
      Record<MediaSlotKey, string | undefined> &
        Record<ColorKey, string | undefined> &
        Record<TextKey, string | undefined>
    >,
  ) => void;
};

const DEFAULT_PANEL = "#1c1c20";
const inputClass =
  "w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground";

function ColorPickerField({
  label,
  value,
  swatches,
  onChange,
}: {
  label: string;
  value: string;
  swatches: string[];
  onChange: (hex: string) => void;
}) {
  const unique = Array.from(new Set(swatches.filter(Boolean)));

  return (
    <label className="block text-xs text-muted">
      <span className="mb-1.5 block">{label}</span>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-11 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 rounded-lg border border-border bg-background px-2 py-1.5 font-mono text-xs text-foreground"
        />
        {unique.map((hex) => (
          <button
            key={hex}
            type="button"
            title={hex}
            onClick={() => onChange(hex)}
            className="h-7 w-7 rounded-full border border-border"
            style={{ backgroundColor: hex }}
            aria-label={`Use ${hex}`}
          />
        ))}
      </div>
    </label>
  );
}

function Slot({
  label,
  hint,
  mediaId,
  className,
  fit = "cover",
  imageClassName,
  style,
  onUpload,
  onClear,
}: {
  label: string;
  hint: string;
  mediaId?: string;
  className?: string;
  fit?: "cover" | "contain";
  imageClassName?: string;
  style?: React.CSSProperties;
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
        mediaId
          ? "bg-surface-elevated"
          : "admin-upload-empty"
      } ${
        fit === "contain" ? "flex items-center justify-center p-6" : ""
      } ${className ?? ""}`}
      style={style}
    >
      {mediaId ? (
        <MediaImage
          mediaId={mediaId}
          alt={label}
          fit={fit}
          className={imageClassName}
        />
      ) : (
        <div
          className={`flex w-full flex-col items-center justify-center gap-2 px-4 text-center ${
            fit === "cover" ? "absolute inset-0" : "min-h-[6rem]"
          }`}
        >
          <ImagePlus className="text-muted" size={22} />
          <p className="text-xs font-medium text-foreground/80">{label}</p>
          <p className="text-[11px] text-muted">{hint}</p>
        </div>
      )}

      <div className="absolute inset-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/55 via-transparent to-transparent p-3 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-black disabled:opacity-50"
        >
          {busy ? "Loading…" : mediaId ? "Change" : "Upload"}
        </button>
        {mediaId ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-full bg-black/70 p-2 text-white"
            aria-label={`Remove ${label}`}
          >
            <Trash2 size={14} />
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

export function BentoMediaEditor({
  logoMediaId,
  mockupMediaId,
  coverMediaId,
  coverInsetMediaId,
  logoBackgroundColor = DEFAULT_PANEL,
  industryBackgroundColor = DEFAULT_PANEL,
  servicesBackgroundColor = DEFAULT_PANEL,
  coverHeadline = "",
  coverStat1Value = "",
  coverStat1Label = "YEAR",
  coverStat2Value = "",
  coverStat2Label = "",
  brandColors = [],
  title,
  client,
  year,
  industry,
  services = [],
  onChange,
}: Props) {
  async function setSlot(key: MediaSlotKey, file: File) {
    const asset = await uploadMedia(file);
    onChange({ [key]: asset.id });
  }

  const swatches = [
    DEFAULT_PANEL,
    "#0f0f10",
    "#ffffff",
    "#f2efe8",
    ...brandColors.map((c) => c.hex),
  ];

  const previewProject = {
    title: title || "Project title",
    coverHeadline,
    coverStat1Value,
    coverStat1Label,
    coverStat2Value,
    coverStat2Label,
    coverInsetMediaId,
    logoMediaId,
    year: year ?? new Date().getFullYear(),
    client: client || "",
  } as BrandingProject;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted">
          Hero photos (bento)
        </h2>
        <p className="mt-1 text-xs text-muted">
          These slots appear at the top of the project page. Click to upload.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-12">
        <div className="flex flex-col gap-3 sm:col-span-4 lg:col-span-3">
          <Slot
            label="Logo"
            hint="Top-left panel"
            mediaId={logoMediaId}
            fit="contain"
            className="aspect-[4/3] min-h-0"
            imageClassName="max-h-20 md:max-h-24"
            style={{ backgroundColor: logoBackgroundColor }}
            onUpload={(file) => setSlot("logoMediaId", file)}
            onClear={() => onChange({ logoMediaId: undefined })}
          />
          <Slot
            label="Mockup"
            hint="Bottom-left panel"
            mediaId={mockupMediaId}
            fit="cover"
            className="min-h-[12rem] flex-1"
            onUpload={(file) => setSlot("mockupMediaId", file)}
            onClear={() => onChange({ mockupMediaId: undefined })}
          />
        </div>

        <div className="relative sm:col-span-8 lg:col-span-9">
          <div className="pointer-events-none">
            <CoverHeroPanel
              project={previewProject}
              coverMediaId={coverMediaId}
              className="min-h-[16rem] sm:min-h-[20rem] lg:min-h-[22rem]"
            />
          </div>
          <div className="absolute left-3 top-3 z-10 flex gap-2">
            <label className="cursor-pointer rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-black shadow">
              Cover
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void setSlot("coverMediaId", file);
                }}
              />
            </label>
            <label className="cursor-pointer rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white shadow">
              Inset
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void setSlot("coverInsetMediaId", file);
                }}
              />
            </label>
            {coverMediaId ? (
              <button
                type="button"
                onClick={() => onChange({ coverMediaId: undefined })}
                className="rounded-full bg-black/70 p-2 text-white"
                aria-label="Remove cover"
              >
                <Trash2 size={14} />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-[var(--radius-md)] border border-border bg-background/40 p-4">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted">
          Cover text
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs text-muted sm:col-span-2">
            Headline (if empty → title)
            <input
              className={`${inputClass} mt-1`}
              value={coverHeadline}
              placeholder={title || "Project title"}
              onChange={(e) => onChange({ coverHeadline: e.target.value })}
            />
          </label>
          <label className="block text-xs text-muted">
            Stat 1 — value
            <input
              className={`${inputClass} mt-1`}
              value={coverStat1Value}
              placeholder={String(year ?? "")}
              onChange={(e) => onChange({ coverStat1Value: e.target.value })}
            />
          </label>
          <label className="block text-xs text-muted">
            Stat 1 — label
            <input
              className={`${inputClass} mt-1`}
              value={coverStat1Label}
              onChange={(e) => onChange({ coverStat1Label: e.target.value })}
            />
          </label>
          <label className="block text-xs text-muted">
            Stat 2 — value
            <input
              className={`${inputClass} mt-1`}
              value={coverStat2Value}
              placeholder="+3K"
              onChange={(e) => onChange({ coverStat2Value: e.target.value })}
            />
          </label>
          <label className="block text-xs text-muted">
            Stat 2 — label
            <input
              className={`${inputClass} mt-1`}
              value={coverStat2Label}
              placeholder="NEW SONGS"
              onChange={(e) => onChange({ coverStat2Label: e.target.value })}
            />
          </label>
        </div>
      </div>

      <div className="space-y-4 rounded-[var(--radius-md)] border border-border bg-background/40 p-4">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted">
          Panel backgrounds
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <ColorPickerField
            label="Logo background"
            value={logoBackgroundColor}
            swatches={swatches}
            onChange={(hex) => onChange({ logoBackgroundColor: hex })}
          />
          <ColorPickerField
            label="Industry background"
            value={industryBackgroundColor}
            swatches={swatches}
            onChange={(hex) => onChange({ industryBackgroundColor: hex })}
          />
          <ColorPickerField
            label="Services background"
            value={servicesBackgroundColor}
            swatches={swatches}
            onChange={(hex) => onChange({ servicesBackgroundColor: hex })}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div
            className="rounded-[var(--radius-lg)] p-4 text-sm"
            style={{
              backgroundColor: industryBackgroundColor,
              color: contrastingInk(industryBackgroundColor),
            }}
          >
            <p
              className="text-[10px] uppercase tracking-[0.2em]"
              style={{ color: mutedInk(industryBackgroundColor) }}
            >
              Industry
            </p>
            <p className="mt-1">{industry || "—"}</p>
          </div>
          <div
            className="rounded-[var(--radius-lg)] p-4 text-sm"
            style={{
              backgroundColor: servicesBackgroundColor,
              color: contrastingInk(servicesBackgroundColor),
            }}
          >
            <p
              className="text-[10px] uppercase tracking-[0.2em]"
              style={{ color: mutedInk(servicesBackgroundColor) }}
            >
              Services
            </p>
            <p className="mt-1 opacity-90">
              {services.length ? services.join(" · ") : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
