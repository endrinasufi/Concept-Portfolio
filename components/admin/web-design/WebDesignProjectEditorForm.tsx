"use client";

import { useState } from "react";
import Link from "next/link";
import type { WebDesignProject } from "@/types/web-design";
import { emptyWebDesignProjectDraft } from "@/types/web-design";
import { slugify } from "@/lib/utils/id";
import { WebDesignFeaturedVisualEditor } from "./WebDesignFeaturedVisualEditor";
import { WebDesignGalleryEditor } from "./WebDesignGalleryEditor";
import { ExternalLink, Trash2 } from "lucide-react";
import { MediaImage } from "@/components/branding/MediaImage";
import { uploadWebDesignAsset } from "@/lib/web-design/media";
import { WEB_DESIGN_COVER_FRAME } from "@/types/web-design";

export type WebDesignProjectFormValue = Omit<
  WebDesignProject,
  "id" | "createdAt" | "updatedAt" | "service"
>;

export function emptyWebDesignProjectForm(): WebDesignProjectFormValue {
  const d = emptyWebDesignProjectDraft();
  return {
    slug: d.slug,
    title: d.title,
    serviceLabel: d.serviceLabel,
    projectNumber: d.projectNumber,
    client: d.client,
    industry: d.industry,
    year: d.year,
    services: d.services,
    descriptionTitle: d.descriptionTitle,
    description: d.description,
    websiteUrl: d.websiteUrl,
    status: d.status,
    order: d.order,
    featured: d.featured,
    coverMediaId: d.coverMediaId,
    coverImageUrl: d.coverImageUrl,
    appearance: d.appearance,
    featuredVisual: d.featuredVisual,
    gallery: d.gallery,
    seo: d.seo,
  };
}

const field =
  "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";
const label = "block text-xs uppercase tracking-[0.16em] text-muted";

export function WebDesignProjectEditorForm({
  initial,
  saving,
  onSave,
}: {
  initial: WebDesignProjectFormValue;
  saving?: boolean;
  onSave: (value: WebDesignProjectFormValue) => Promise<void>;
}) {
  const [value, setValue] = useState<WebDesignProjectFormValue>(initial);

  function patch(partial: Partial<WebDesignProjectFormValue>) {
    setValue((v) => ({ ...v, ...partial }));
  }

  return (
    <form
      className="space-y-10"
      onSubmit={(e) => {
        e.preventDefault();
        void onSave({
          ...value,
          slug: value.slug || slugify(value.title),
        });
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl">
            {initial.title ? "Edito projektin" : "Projekt Web Design i ri"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Tre imazhe të ndara për featured visual + carousel.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {value.slug ? (
            <Link
              href={`/web-design/${value.slug}?preview=true`}
              target="_blank"
              className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm"
            >
              <ExternalLink size={14} /> Preview
            </Link>
          ) : null}
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background disabled:opacity-50"
          >
            {saving ? "Duke ruajtur…" : "Ruaj"}
          </button>
        </div>
      </div>

      <section className="admin-card space-y-4 p-5">
        <h2 className="text-xs uppercase tracking-[0.2em] text-muted">General</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className={label}>Title</span>
            <input
              className={field}
              value={value.title}
              onChange={(e) =>
                patch({
                  title: e.target.value,
                  slug: value.slug || slugify(e.target.value),
                })
              }
              required
            />
          </label>
          <label>
            <span className={label}>Slug</span>
            <input
              className={field}
              value={value.slug}
              onChange={(e) => patch({ slug: slugify(e.target.value) })}
            />
          </label>
          <label>
            <span className={label}>Service label</span>
            <input
              className={field}
              value={value.serviceLabel}
              onChange={(e) => patch({ serviceLabel: e.target.value })}
            />
          </label>
          <label>
            <span className={label}>Status</span>
            <select
              className={field}
              value={value.status}
              onChange={(e) =>
                patch({
                  status: e.target.value as WebDesignProjectFormValue["status"],
                })
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
        </div>
      </section>

      <section className="admin-card space-y-4 p-5">
        <h2 className="text-xs uppercase tracking-[0.2em] text-muted">
          Project information
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className={label}>Client</span>
            <input
              className={field}
              value={value.client ?? ""}
              onChange={(e) => patch({ client: e.target.value })}
            />
          </label>
          <label>
            <span className={label}>Year</span>
            <input
              className={field}
              value={value.year ?? ""}
              onChange={(e) => patch({ year: e.target.value })}
            />
          </label>
          <label>
            <span className={label}>Industry</span>
            <input
              className={field}
              value={value.industry ?? ""}
              onChange={(e) => patch({ industry: e.target.value })}
            />
          </label>
          <label>
            <span className={label}>Website URL</span>
            <input
              className={field}
              value={value.websiteUrl ?? ""}
              onChange={(e) => patch({ websiteUrl: e.target.value })}
            />
          </label>
          <label className="md:col-span-2">
            <span className={label}>Services (ndarë me presje)</span>
            <input
              className={field}
              value={value.services.join(", ")}
              onChange={(e) =>
                patch({
                  services: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </label>
          <label>
            <span className={label}>Description title</span>
            <input
              className={field}
              value={value.descriptionTitle}
              onChange={(e) => patch({ descriptionTitle: e.target.value })}
            />
          </label>
          <label>
            <span className={label}>Project number (opsionale)</span>
            <input
              type="number"
              className={field}
              value={value.projectNumber ?? ""}
              onChange={(e) =>
                patch({
                  projectNumber: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
            />
          </label>
          <label className="md:col-span-2">
            <span className={label}>Description</span>
            <textarea
              rows={5}
              className={field}
              value={value.description}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </label>
        </div>
      </section>

      <section className="admin-card space-y-4 p-5">
        <h2 className="text-xs uppercase tracking-[0.2em] text-muted">
          Cover (lista /web-design)
        </h2>
        <p className="text-xs text-muted">
          Fotoja që shfaqet te karta e projektit në faqen e listës.
        </p>
        <div className="flex flex-wrap items-start gap-4">
          <div className="relative h-24 w-40 overflow-hidden rounded-lg bg-surface-elevated">
            <MediaImage
              mediaId={value.coverMediaId}
              imageUrl={value.coverImageUrl}
              alt="Cover"
              fit="cover"
            />
          </div>
          <div className="space-y-2">
            <label className="inline-flex cursor-pointer items-center rounded-full border border-border px-3 py-1.5 text-xs hover:bg-surface-elevated">
              Upload cover
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  void uploadWebDesignAsset(file).then((asset) => {
                    patch({
                      coverMediaId: asset.id,
                      coverImageUrl: undefined,
                    });
                  });
                }}
              />
            </label>
            {(value.coverMediaId || value.coverImageUrl) && (
              <button
                type="button"
                onClick={() =>
                  patch({ coverMediaId: undefined, coverImageUrl: undefined })
                }
                className="inline-flex items-center gap-1 rounded-full border border-red-500/30 px-3 py-1.5 text-xs text-red-400"
              >
                <Trash2 size={12} /> Hiq
              </button>
            )}
            <p className="text-[11px] text-muted">
              Përmasa: {WEB_DESIGN_COVER_FRAME.width} ×{" "}
              {WEB_DESIGN_COVER_FRAME.height} px ·{" "}
              {WEB_DESIGN_COVER_FRAME.ratioLabel}
            </p>
          </div>
        </div>
      </section>

      <section className="admin-card space-y-4 p-5">
        <h2 className="text-xs uppercase tracking-[0.2em] text-muted">
          Featured website presentation
        </h2>
        <WebDesignFeaturedVisualEditor
          value={value.featuredVisual}
          onChange={(featuredVisual) => patch({ featuredVisual })}
        />
      </section>

      <section className="admin-card space-y-4 p-5">
        <h2 className="text-xs uppercase tracking-[0.2em] text-muted">
          Additional screenshots
        </h2>
        <WebDesignGalleryEditor
          items={value.gallery}
          onChange={(gallery) => patch({ gallery })}
        />
      </section>

      <section className="admin-card space-y-4 p-5">
        <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Appearance</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <label>
            <span className={label}>Page background</span>
            <input
              type="color"
              className="mt-1 h-10 w-full rounded border border-border bg-background"
              value={value.appearance.pageBackgroundColor}
              onChange={(e) =>
                patch({
                  appearance: {
                    ...value.appearance,
                    pageBackgroundColor: e.target.value,
                  },
                })
              }
            />
          </label>
          <label>
            <span className={label}>Text color</span>
            <input
              type="color"
              className="mt-1 h-10 w-full rounded border border-border bg-background"
              value={value.appearance.textColor}
              onChange={(e) =>
                patch({
                  appearance: {
                    ...value.appearance,
                    textColor: e.target.value,
                  },
                })
              }
            />
          </label>
          <label>
            <span className={label}>Accent</span>
            <input
              type="color"
              className="mt-1 h-10 w-full rounded border border-border bg-background"
              value={value.appearance.accentColor}
              onChange={(e) =>
                patch({
                  appearance: {
                    ...value.appearance,
                    accentColor: e.target.value,
                  },
                })
              }
            />
          </label>
        </div>
      </section>

      <section className="admin-card space-y-4 p-5">
        <h2 className="text-xs uppercase tracking-[0.2em] text-muted">SEO</h2>
        <label>
          <span className={label}>Meta title</span>
          <input
            className={field}
            value={value.seo.metaTitle ?? ""}
            onChange={(e) =>
              patch({ seo: { ...value.seo, metaTitle: e.target.value } })
            }
          />
        </label>
        <label>
          <span className={label}>Meta description</span>
          <textarea
            rows={3}
            className={field}
            value={value.seo.metaDescription ?? ""}
            onChange={(e) =>
              patch({ seo: { ...value.seo, metaDescription: e.target.value } })
            }
          />
        </label>
      </section>
    </form>
  );
}
