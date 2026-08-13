"use client";

import { use, useEffect, useState } from "react";
import { VideoProductionEditorForm } from "@/components/admin/video-production/VideoProductionEditorForm";
import { useVideoProductionById } from "@/lib/hooks/useVideoProduction";
import { getVideoProductionRepository } from "@/lib/repositories";
import type { VideoProductionItem } from "@/types/video-production";
import Link from "next/link";

export default function AdminVideoProductionEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { video, loading, notFound } = useVideoProductionById(id);
  const [form, setForm] = useState<VideoProductionItem | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (video) setForm(video);
  }, [video]);

  if (loading) return <p className="text-muted">Duke ngarkuar…</p>;
  if (notFound || !form) {
    return (
      <div>
        <p className="text-muted">Video nuk u gjet.</p>
        <Link href="/admin/video-production" className="mt-4 inline-block text-accent">
          ← Kthehu
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Ndrysho videon</h1>
          <p className="mt-1 text-sm text-muted">{form.clientName}</p>
        </div>
        <Link
          href="/video-production/social"
          className="text-sm text-muted hover:text-foreground"
        >
          Shiko faqen →
        </Link>
      </div>
      {saved ? (
        <p className="mb-4 text-sm text-emerald-300">U ruajt.</p>
      ) : null}
      <VideoProductionEditorForm
        value={form}
        onChange={(next) => setForm({ ...form, ...next })}
        submitLabel="Ruaj"
        onSubmit={async (next) => {
          await getVideoProductionRepository().update(form.id, {
            title: next.title,
            clientName: next.clientName,
            youtubeId: next.youtubeId,
            description: next.description,
            orientation: next.orientation,
            accentColor: next.accentColor,
            status: next.status,
            order: next.order,
          });
          setForm({ ...form, ...next });
          setSaved(true);
          window.setTimeout(() => setSaved(false), 2000);
        }}
      />
    </div>
  );
}
