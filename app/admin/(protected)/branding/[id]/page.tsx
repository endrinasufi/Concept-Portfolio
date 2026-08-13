"use client";

import { use, useState } from "react";
import { useProjectById } from "@/lib/hooks/useProjects";
import { getProjectRepository } from "@/lib/repositories";
import { ProjectEditorForm } from "@/components/admin/ProjectEditorForm";

export default function EditBrandingProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { project, loading, error, refresh } = useProjectById(id);
  const [saving, setSaving] = useState(false);

  if (loading) {
    return <p className="text-muted">Duke ngarkuar…</p>;
  }

  if (error || !project) {
    return <p className="text-red-400">{error ?? "Projekti nuk u gjet"}</p>;
  }

  return (
    <ProjectEditorForm
      key={project.updatedAt}
      initial={project}
      saving={saving}
      onSave={async (value) => {
        setSaving(true);
        try {
          await getProjectRepository().update(id, value);
          await refresh();
        } finally {
          setSaving(false);
        }
      }}
    />
  );
}
