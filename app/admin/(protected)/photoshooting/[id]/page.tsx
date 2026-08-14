"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { PhotoshootingEditorForm } from "@/components/admin/photoshooting/PhotoshootingEditorForm";
import { usePhotoshootingById } from "@/lib/hooks/usePhotoshooting";
import { getPhotoshootingRepository } from "@/lib/repositories";
import type { PhotoshootingProject } from "@/types/photoshooting";

export default function AdminPhotoshootingEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { project, loading, notFound } = usePhotoshootingById(id);
  const [form, setForm] = useState<PhotoshootingProject | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (project) setForm(project);
  }, [project]);

  if (loading) return <p className="text-muted">Duke ngarkuar…</p>;
  if (notFound || !form) {
    return (
      <div>
        <p className="text-muted">Projekti nuk u gjet.</p>
        <Link href="/admin/photoshooting" className="mt-4 inline-block text-accent">
          ← Kthehu
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl">Ndrysho projektin</h1>
          <p className="mt-1 text-sm text-muted">{form.clientName}</p>
        </div>
        <Link
          href={`/photoshooting/${form.slug}`}
          className="text-sm text-muted hover:text-foreground"
        >
          Shiko faqen →
        </Link>
      </div>
      {saved ? (
        <p className="mb-4 text-sm text-emerald-300">U ruajt.</p>
      ) : null}
      <PhotoshootingEditorForm
        value={form}
        onChange={(next) => setForm({ ...form, ...next })}
        submitLabel="Ruaj"
        onSubmit={async (next) => {
          await getPhotoshootingRepository().update(form.id, {
            title: next.title,
            slug: next.slug,
            clientName: next.clientName,
            year: next.year,
            shortDescription: next.shortDescription,
            coverImageUrl: next.coverImageUrl,
            coverMediaId: next.coverMediaId,
            status: next.status,
            featured: next.featured,
            order: next.order,
            cells: next.cells,
          });
          setForm({ ...form, ...next });
          setSaved(true);
          window.setTimeout(() => setSaved(false), 2000);
        }}
      />
    </div>
  );
}
