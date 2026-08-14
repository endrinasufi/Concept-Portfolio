"use client";

import type {
  BrandingProject,
  BrandColor,
  GalleryRow,
} from "@/types/branding";
import { ColorManager } from "./ColorManager";
import { GalleryManager } from "./GalleryManager";
import { BentoMediaEditor } from "./BentoMediaEditor";
import { ProjectVideoEditor } from "./ProjectVideoEditor";
import { slugify } from "@/lib/utils/id";
import { flattenGalleryRows, getGalleryRows } from "@/lib/utils/galleryRows";
import Link from "next/link";
import { ExternalLink, Save } from "lucide-react";
import { useState } from "react";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

export type ProjectFormValue = Omit<
  BrandingProject,
  "id" | "createdAt" | "updatedAt" | "service"
> & { id?: string };

export function emptyProjectForm(): ProjectFormValue {
  return {
    slug: "",
    title: "",
    shortDescription: "",
    brandAbout: "",
    client: "",
    industry: "",
    year: new Date().getFullYear(),
    services: [],
    primaryBackgroundColor: "#0f0f10",
    secondaryBackgroundColor: "#1a222c",
    logoBackgroundColor: "#1c1c20",
    industryBackgroundColor: "#1c1c20",
    servicesBackgroundColor: "#1c1c20",
    coverHeadline: "",
    coverStat1Value: "",
    coverStat1Label: "VITI",
    coverStat2Value: "",
    coverStat2Label: "",
    aboutPuzzleMediaIds: ["", "", ""],
    brandColors: [
      { id: crypto.randomUUID(), hex: "#D4A574", order: 0 },
      { id: crypto.randomUUID(), hex: "#1A1A1A", order: 1 },
    ],
    typography: [],
    status: "draft",
    featured: false,
    order: 0,
    sections: [],
    gallery: [],
    galleryRows: [],
    videoMediaId: undefined,
    metaTitle: "",
    metaDescription: "",
  };
}

export function ProjectEditorForm({
  initial,
  onSave,
  saving,
}: {
  initial: ProjectFormValue;
  onSave: (value: ProjectFormValue) => Promise<void>;
  saving?: boolean;
}) {
  const [form, setForm] = useState<ProjectFormValue>(() => ({
    ...initial,
    galleryRows: getGalleryRows(initial),
  }));
  const [servicesRaw, setServicesRaw] = useState(initial.services.join(", "));
  const [message, setMessage] = useState<string | null>(null);

  function patch(p: Partial<ProjectFormValue>) {
    setForm((f) => ({ ...f, ...p }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const services = servicesRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload: ProjectFormValue = {
      ...form,
      services,
      slug: form.slug || slugify(form.title),
      brandColors: form.brandColors.map((c, i) => ({ ...c, order: i })),
      sections: [],
      typography: form.typography ?? [],
      galleryRows: (form.galleryRows ?? []).map((row, i) => ({
        ...row,
        order: i,
        items: row.items.map((g, j) => ({ ...g, order: j })),
      })),
      gallery: flattenGalleryRows(form.galleryRows ?? []),
    };
    if (payload.brandColors.length < 2 || payload.brandColors.length > 5) {
      setMessage("Paleta duhet të ketë 2–5 ngjyra.");
      return;
    }
    try {
      await onSave(payload);
      setMessage("U ruajt.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Gabim në ruajtje");
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-10 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">
            {initial.id ? "Edito projektin" : "Projekt i ri"}
          </h1>
          {form.slug ? (
            <p className="mt-1 text-sm text-muted">/{form.slug}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {form.slug ? (
            <Link
              href={`/branding/${form.slug}?preview=true`}
              target="_blank"
              className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm"
            >
              <ExternalLink size={14} /> Preview
            </Link>
          ) : null}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background disabled:opacity-50"
          >
            <Save size={14} /> {saving ? "Duke ruajtur…" : "Ruaj"}
          </button>
        </div>
      </div>

      {message ? (
        <p className="rounded-lg border border-border bg-surface px-3 py-2 text-sm">{message}</p>
      ) : null}

      <section className="space-y-4 admin-card p-5">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Meta</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs text-muted sm:col-span-2">
            Titulli
            <input
              required
              className={`${inputClass} mt-1`}
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                patch({
                  title,
                  slug: form.slug && initial.id ? form.slug : slugify(title),
                });
              }}
            />
          </label>
          <label className="block text-xs text-muted">
            Slug
            <input
              required
              className={`${inputClass} mt-1`}
              value={form.slug}
              onChange={(e) => patch({ slug: slugify(e.target.value) })}
            />
          </label>
          <label className="block text-xs text-muted">
            Klienti
            <input
              className={`${inputClass} mt-1`}
              value={form.client}
              onChange={(e) => patch({ client: e.target.value })}
            />
          </label>
          <label className="block text-xs text-muted">
            Industria
            <input
              className={`${inputClass} mt-1`}
              value={form.industry}
              onChange={(e) => patch({ industry: e.target.value })}
            />
          </label>
          <label className="block text-xs text-muted">
            Viti
            <input
              type="number"
              className={`${inputClass} mt-1`}
              value={form.year}
              onChange={(e) => patch({ year: Number(e.target.value) })}
            />
          </label>
          <label className="block text-xs text-muted sm:col-span-2">
            Përshkrim i shkurtër
            <textarea
              className={`${inputClass} mt-1`}
              rows={2}
              value={form.shortDescription}
              onChange={(e) => patch({ shortDescription: e.target.value })}
              placeholder="Identitet vizual me ** fokusë bold** për theks…"
            />
            <span className="mt-1 block text-[11px] text-muted/80">
              Për bold në mosaik: vendos fjalët mes dy yjesh, p.sh.{" "}
              <code className="text-foreground/70">**fjalë**</code> ose{" "}
              <code className="text-foreground/70">**disa fjalë bashkë**</code>
            </span>
          </label>
          <label className="block text-xs text-muted sm:col-span-2">
            Tekst shpjegues i brandit
            <textarea
              className={`${inputClass} mt-1`}
              rows={5}
              value={form.brandAbout ?? ""}
              onChange={(e) => patch({ brandAbout: e.target.value })}
              placeholder="Shpjegim më i gjatë për markën — shfaqet poshtë fotove…"
            />
            <span className="mt-1 block text-[11px] text-muted/80">
              Shfaqet poshtë përshkrimit të shkurtër, majtas, gjerësi e plotë.
            </span>
          </label>
          <label className="block text-xs text-muted sm:col-span-2">
            Shërbimet (ndara me presje)
            <input
              className={`${inputClass} mt-1`}
              value={servicesRaw}
              onChange={(e) => setServicesRaw(e.target.value)}
            />
          </label>
          <label className="block text-xs text-muted">
            Sfondi 1
            <div className="mt-1 flex gap-2">
              <input
                type="color"
                value={form.primaryBackgroundColor}
                onChange={(e) => patch({ primaryBackgroundColor: e.target.value })}
                className="h-10 w-12 rounded border-0"
              />
              <input
                className={inputClass}
                value={form.primaryBackgroundColor}
                onChange={(e) => patch({ primaryBackgroundColor: e.target.value })}
              />
            </div>
          </label>
          <label className="block text-xs text-muted">
            Sfondi 2
            <div className="mt-1 flex gap-2">
              <input
                type="color"
                value={form.secondaryBackgroundColor || form.primaryBackgroundColor}
                onChange={(e) =>
                  patch({ secondaryBackgroundColor: e.target.value })
                }
                className="h-10 w-12 rounded border-0"
              />
              <input
                className={inputClass}
                value={
                  form.secondaryBackgroundColor || form.primaryBackgroundColor
                }
                onChange={(e) =>
                  patch({ secondaryBackgroundColor: e.target.value })
                }
              />
            </div>
          </label>
          <label className="block text-xs text-muted">
            Status
            <select
              className={`${inputClass} mt-1`}
              value={form.status}
              onChange={(e) =>
                patch({ status: e.target.value as "draft" | "published" })
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm mt-6">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => patch({ featured: e.target.checked })}
            />
            Featured
          </label>
        </div>
      </section>

      <section className="admin-card p-5">
        <BentoMediaEditor
          logoMediaId={form.logoMediaId}
          mockupMediaId={form.mockupMediaId}
          coverMediaId={form.coverMediaId}
          coverInsetMediaId={form.coverInsetMediaId}
          logoBackgroundColor={form.logoBackgroundColor}
          industryBackgroundColor={form.industryBackgroundColor}
          servicesBackgroundColor={form.servicesBackgroundColor}
          coverHeadline={form.coverHeadline}
          coverStat1Value={form.coverStat1Value}
          coverStat1Label={form.coverStat1Label}
          coverStat2Value={form.coverStat2Value}
          coverStat2Label={form.coverStat2Label}
          brandColors={form.brandColors}
          title={form.title}
          client={form.client}
          year={form.year}
          industry={form.industry}
          services={servicesRaw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)}
          onChange={(media) => patch(media)}
        />
      </section>

      <section className="space-y-4 admin-card p-5">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted">SEO</h2>
        <label className="block text-xs text-muted">
          Meta title
          <input
            className={`${inputClass} mt-1`}
            value={form.metaTitle ?? ""}
            onChange={(e) => patch({ metaTitle: e.target.value })}
          />
        </label>
        <label className="block text-xs text-muted">
          Meta description
          <textarea
            className={`${inputClass} mt-1`}
            rows={2}
            value={form.metaDescription ?? ""}
            onChange={(e) => patch({ metaDescription: e.target.value })}
          />
        </label>
      </section>

      <section className="admin-card p-5">
        <ColorManager
          colors={form.brandColors}
          onChange={(brandColors: BrandColor[]) => patch({ brandColors })}
        />
      </section>

      <section className="admin-card p-5">
        <GalleryManager
          rows={form.galleryRows ?? []}
          onChange={(galleryRows: GalleryRow[]) =>
            patch({
              galleryRows,
              gallery: flattenGalleryRows(galleryRows),
            })
          }
        />
      </section>

      <section className="admin-card p-5">
        <ProjectVideoEditor
          videoMediaId={form.videoMediaId}
          onChange={(videoMediaId) => patch({ videoMediaId })}
        />
      </section>

      <div className="flex justify-end gap-3 pb-10">
        <Link href="/admin/branding" className="rounded-full border border-border px-5 py-2 text-sm">
          Anulo
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-foreground px-6 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {saving ? "Duke ruajtur…" : "Ruaj projektin"}
        </button>
      </div>
    </form>
  );
}
