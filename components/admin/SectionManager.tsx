"use client";

import type { BrandingSection, BrandingSectionType } from "@/types/branding";
import { createId, sortByOrder } from "@/lib/utils/id";
import { SortableList, SortableItem } from "./SortableList";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useConfirm } from "./ConfirmDialog";
import { AdminUploadDropzone } from "./AdminUploadDropzone";
import { uploadMedia } from "@/lib/media";

const SECTION_TYPES: { type: BrandingSectionType; label: string }[] = [
  { type: "text", label: "Text" },
  { type: "logo", label: "Logo" },
  { type: "image", label: "Image" },
  { type: "fullWidthImage", label: "Full-width image" },
  { type: "imageGrid2", label: "Grid 2" },
  { type: "imageGrid3", label: "Grid 3" },
  { type: "typography", label: "Typography" },
  { type: "colorPalette", label: "Palette" },
  { type: "video", label: "Video" },
  { type: "brandApplication", label: "Brand application" },
  { type: "mockup", label: "Mockup" },
  { type: "spacer", label: "Spacer" },
  { type: "gallery", label: "Section gallery" },
];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs text-muted">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground";

async function handleFile(
  file: File | undefined,
  onId: (mediaId: string) => void,
) {
  if (!file) return;
  const asset = await uploadMedia(file);
  onId(asset.id);
}

function SectionEditor({
  section,
  onChange,
}: {
  section: BrandingSection;
  onChange: (s: BrandingSection) => void;
}) {
  const c = section.content;
  const set = (patch: Record<string, unknown>) =>
    onChange({ ...section, content: { ...c, ...patch } });
  const setSettings = (patch: Record<string, unknown>) =>
    onChange({ ...section, settings: { ...section.settings, ...patch } });

  switch (section.type) {
    case "text":
      return (
        <div className="space-y-2">
          <Field label="Title">
            <input
              className={inputClass}
              value={String(c.heading ?? "")}
              onChange={(e) => set({ heading: e.target.value })}
            />
          </Field>
          <Field label="Body">
            <textarea
              className={inputClass}
              rows={3}
              value={String(c.body ?? "")}
              onChange={(e) => set({ body: e.target.value })}
            />
          </Field>
        </div>
      );
    case "image":
    case "fullWidthImage":
    case "mockup":
    case "brandApplication":
    case "logo":
      return (
        <div className="space-y-2">
          <AdminUploadDropzone
            label="Upload image"
            hint="JPG / PNG / WebP"
            onFiles={(files) =>
              void handleFile(files?.[0], (mediaId) => set({ mediaId }))
            }
          />
          <Field label="or external URL">
            <input
              className={inputClass}
              value={String(c.imageUrl ?? "")}
              onChange={(e) => set({ imageUrl: e.target.value })}
            />
          </Field>
          <Field label="Caption">
            <input
              className={inputClass}
              value={String(c.caption ?? "")}
              onChange={(e) => set({ caption: e.target.value })}
            />
          </Field>
          {section.type === "image" ? (
            <div className="grid grid-cols-2 gap-2">
              <Field label="Object X %">
                <input
                  type="number"
                  className={inputClass}
                  value={Number(section.settings.objectPositionX ?? 50)}
                  onChange={(e) =>
                    setSettings({ objectPositionX: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Object Y %">
                <input
                  type="number"
                  className={inputClass}
                  value={Number(section.settings.objectPositionY ?? 50)}
                  onChange={(e) =>
                    setSettings({ objectPositionY: Number(e.target.value) })
                  }
                />
              </Field>
            </div>
          ) : null}
          {c.mediaId ? (
            <p className="text-[10px] font-mono text-muted">mediaId: {String(c.mediaId)}</p>
          ) : null}
        </div>
      );
    case "imageGrid2":
      return (
        <div className="space-y-3">
          {(["A", "B"] as const).map((key) => (
            <div key={key} className="space-y-1 rounded border border-border/60 p-2">
              <p className="text-xs text-muted">Image {key}</p>
              <AdminUploadDropzone
                label={`Upload image ${key}`}
                className="min-h-[4.25rem] py-3"
                onFiles={(files) =>
                  void handleFile(files?.[0], (mediaId) =>
                    set({ [`mediaId${key}`]: mediaId }),
                  )
                }
              />
              <input
                className={inputClass}
                placeholder="URL"
                value={String(c[`imageUrl${key}`] ?? "")}
                onChange={(e) => set({ [`imageUrl${key}`]: e.target.value })}
              />
            </div>
          ))}
        </div>
      );
    case "imageGrid3":
      return (
        <div className="space-y-3">
          {(["A", "B", "C"] as const).map((key) => (
            <div key={key} className="space-y-1 rounded border border-border/60 p-2">
              <p className="text-xs text-muted">Image {key}</p>
              <AdminUploadDropzone
                label={`Upload image ${key}`}
                className="min-h-[4.25rem] py-3"
                onFiles={(files) =>
                  void handleFile(files?.[0], (mediaId) =>
                    set({ [`mediaId${key}`]: mediaId }),
                  )
                }
              />
              <input
                className={inputClass}
                placeholder="URL"
                value={String(c[`imageUrl${key}`] ?? "")}
                onChange={(e) => set({ [`imageUrl${key}`]: e.target.value })}
              />
            </div>
          ))}
        </div>
      );
    case "video":
      return (
        <div className="space-y-2">
          <Field label="Embed URL">
            <input
              className={inputClass}
              value={String(c.url ?? "")}
              onChange={(e) => set({ url: e.target.value })}
            />
          </Field>
          <Field label="Caption">
            <input
              className={inputClass}
              value={String(c.caption ?? "")}
              onChange={(e) => set({ caption: e.target.value })}
            />
          </Field>
        </div>
      );
    case "spacer":
      return (
        <Field label="Height (px)">
          <input
            type="number"
            className={inputClass}
            value={Number(section.settings.height ?? 64)}
            onChange={(e) => setSettings({ height: Number(e.target.value) })}
          />
        </Field>
      );
    case "typography":
    case "colorPalette":
      return (
        <p className="text-xs text-muted">
          Uses the project typography / color data.
        </p>
      );
    default:
      return <p className="text-xs text-muted">No extra settings.</p>;
  }
}

export function SectionManager({
  sections,
  onChange,
}: {
  sections: BrandingSection[];
  onChange: (sections: BrandingSection[]) => void;
}) {
  const sorted = sortByOrder(sections);
  const [openId, setOpenId] = useState<string | null>(null);
  const [addType, setAddType] = useState<BrandingSectionType>("text");
  const { confirm, dialog } = useConfirm();

  function add() {
    const next: BrandingSection = {
      id: createId(),
      type: addType,
      order: sections.length,
      settings: {},
      content: {},
    };
    onChange([...sections, next]);
    setOpenId(next.id);
  }

  async function remove(id: string) {
    const ok = await confirm(
      "Delete section?",
      "This action cannot be undone.",
    );
    if (!ok) return;
    onChange(
      sections.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i })),
    );
  }

  function reorder(ids: string[]) {
    onChange(
      ids.map((id, order) => {
        const s = sections.find((x) => x.id === id)!;
        return { ...s, order };
      }),
    );
  }

  function updateSection(next: BrandingSection) {
    onChange(sections.map((s) => (s.id === next.id ? next : s)));
  }

  return (
    <div>
      {dialog}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium">Sections</h3>
        <div className="flex items-center gap-2">
          <select
            value={addType}
            onChange={(e) => setAddType(e.target.value as BrandingSectionType)}
            className="rounded border border-border bg-background px-2 py-1 text-xs"
          >
            {SECTION_TYPES.map((t) => (
              <option key={t.type} value={t.type}>
                {t.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={add}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs"
          >
            <Plus size={12} /> Add section
          </button>
        </div>
      </div>

      <SortableList ids={sorted.map((s) => s.id)} onReorder={reorder}>
        <div className="space-y-2">
          {sorted.map((section) => {
            const label =
              SECTION_TYPES.find((t) => t.type === section.type)?.label ??
              section.type;
            const open = openId === section.id;
            return (
              <SortableItem key={section.id} id={section.id} className="pl-8">
                <div className="rounded-lg border border-border bg-surface/60">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <button
                      type="button"
                      className="flex flex-1 items-center gap-2 text-left text-sm"
                      onClick={() => setOpenId(open ? null : section.id)}
                    >
                      <span className="font-medium">{label}</span>
                      <span className="text-xs text-muted">#{section.order + 1}</span>
                      {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(section.id)}
                      className="rounded p-1.5 text-muted hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {open ? (
                    <div className="border-t border-border p-3">
                      <SectionEditor section={section} onChange={updateSection} />
                    </div>
                  ) : null}
                </div>
              </SortableItem>
            );
          })}
        </div>
      </SortableList>
    </div>
  );
}
