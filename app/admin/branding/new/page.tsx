"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getProjectRepository } from "@/lib/repositories";
import { emptyProjectForm, ProjectEditorForm } from "@/components/admin/ProjectEditorForm";

export default function NewBrandingProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  return (
    <ProjectEditorForm
      initial={emptyProjectForm()}
      saving={saving}
      onSave={async (value) => {
        setSaving(true);
        try {
          const created = await getProjectRepository().create({
            ...value,
            service: "branding",
          });
          router.push(`/admin/branding/${created.id}`);
        } finally {
          setSaving(false);
        }
      }}
    />
  );
}
