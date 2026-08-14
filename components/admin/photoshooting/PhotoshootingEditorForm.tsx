"use client";

import { useState } from "react";
import type { PhotoshootingProject } from "@/types/photoshooting";
import { slugify } from "@/lib/utils/id";
import { uploadMedia } from "@/lib/media";
import { PhotoshootingVisualGridEditor } from "@/components/admin/photoshooting/PhotoshootingVisualGridEditor";
import { AdminUploadDropzone } from "@/components/admin/AdminUploadDropzone";

type FormValue = Omit<PhotoshootingProject, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};

type Props = {
  value: FormValue;
  onChange: (next: FormValue) => void;
  onSubmit: (next: FormValue) => Promise<void>;
  submitLabel: string;
};

export function PhotoshootingEditorForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  function patch(partial: Partial<FormValue>) {
    onChange({ ...value, ...partial });
  }

  async function uploadCover(file: File | undefined) {
    if (!file) return;
    setUploadingCover(true);
    try {
      const asset = await uploadMedia(file);
      patch({ coverMediaId: asset.id, coverImageUrl: undefined });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ngarkimi dështoi");
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.title.trim() || !value.clientName.trim()) {
      setError("Titulli dhe klienti janë të detyrueshëm.");
      return;
    }
    const next = {
      ...value,
      slug: value.slug.trim() || slugify(value.title),
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

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-10">
      <section className="space-y-4 admin-card p-5">
        <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Projekti</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-xs uppercase tracking-[0.2em] text-muted">Titulli</span>
            <input
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
              value={value.title}
              onChange={(e) => {
                const title = e.target.value;
                patch({
                  title,
                  slug: value.slug ? value.slug : slugify(title),
                });
              }}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em] text-muted">Slug</span>
            <input
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
              value={value.slug}
              onChange={(e) => patch({ slug: slugify(e.target.value) })}
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em] text-muted">Klienti</span>
            <input
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
              value={value.clientName}
              onChange={(e) => patch({ clientName: e.target.value })}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em] text-muted">Viti</span>
            <input
              type="number"
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
              value={value.year ?? ""}
              onChange={(e) =>
                patch({ year: e.target.value ? Number(e.target.value) : undefined })
              }
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em] text-muted">Statusi</span>
            <select
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
              value={value.status}
              onChange={(e) =>
                patch({ status: e.target.value as PhotoshootingProject["status"] })
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs uppercase tracking-[0.2em] text-muted">
              Përshkrim i shkurtër
            </span>
            <textarea
              className="mt-2 min-h-[72px] w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
              value={value.shortDescription ?? ""}
              onChange={(e) => patch({ shortDescription: e.target.value })}
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs uppercase tracking-[0.2em] text-muted">Cover</span>
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
                value={value.coverImageUrl ?? ""}
                onChange={(e) =>
                  patch({
                    coverImageUrl: e.target.value,
                    coverMediaId: e.target.value ? undefined : value.coverMediaId,
                  })
                }
                placeholder="https://…"
              />
              <AdminUploadDropzone
                variant="button"
                label={uploadingCover ? "Duke ngarkuar…" : "Ngarko"}
                busy={uploadingCover}
                onFiles={(files) => void uploadCover(files?.[0])}
              />
            </div>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={value.featured}
              onChange={(e) => patch({ featured: e.target.checked })}
            />
            Featured
          </label>
        </div>
      </section>

      <PhotoshootingVisualGridEditor
        cells={value.cells}
        onChange={(cells) => patch({ cells })}
      />

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
