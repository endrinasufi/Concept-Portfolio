"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { VideoProductionEditorForm } from "@/components/admin/video-production/VideoProductionEditorForm";
import { emptyVideoProductionDraft } from "@/types/video-production";
import { getVideoProductionRepository } from "@/lib/repositories";

export default function AdminVideoProductionNewPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyVideoProductionDraft());

  return (
    <div>
      <h1 className="font-display text-3xl">Video e re</h1>
      <p className="mt-2 text-sm text-muted">Shto një video YouTube në portfolio.</p>
      <div className="mt-8">
        <VideoProductionEditorForm
          value={form}
          onChange={setForm}
          submitLabel="Krijo"
          onSubmit={async (next) => {
            const created = await getVideoProductionRepository().create(next);
            router.push(`/admin/video-production/${created.id}`);
          }}
        />
      </div>
    </div>
  );
}
