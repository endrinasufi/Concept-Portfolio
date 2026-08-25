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
      <h1 className="text-3xl">New video</h1>
      <p className="mt-2 text-sm text-muted">Add a YouTube video to the portfolio.</p>
      <div className="mt-8">
        <VideoProductionEditorForm
          value={form}
          onChange={setForm}
          submitLabel="Create"
          onSubmit={async (next) => {
            const created = await getVideoProductionRepository().create(next);
            router.push(`/admin/video-production/${created.id}`);
          }}
        />
      </div>
    </div>
  );
}
