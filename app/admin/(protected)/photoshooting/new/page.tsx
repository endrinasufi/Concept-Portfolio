"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PhotoshootingEditorForm } from "@/components/admin/photoshooting/PhotoshootingEditorForm";
import { emptyPhotoshootingDraft } from "@/types/photoshooting";
import { getPhotoshootingRepository } from "@/lib/repositories";

export default function AdminPhotoshootingNewPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyPhotoshootingDraft());

  return (
    <div>
      <h1 className="text-3xl">Projekt i ri</h1>
      <p className="mt-2 text-sm text-muted">
        Krijo një photoshooting me grid bento.
      </p>
      <div className="mt-8">
        <PhotoshootingEditorForm
          value={form}
          onChange={setForm}
          submitLabel="Krijo"
          onSubmit={async (next) => {
            const created = await getPhotoshootingRepository().create(next);
            router.push(`/admin/photoshooting/${created.id}`);
          }}
        />
      </div>
    </div>
  );
}
