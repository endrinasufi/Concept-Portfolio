"use client";

import { use, useState } from "react";
import { useWebDesignProjectById } from "@/lib/hooks/useWebDesignProjects";
import { getWebDesignProjectRepository } from "@/lib/repositories";
import {
  WebDesignProjectEditorForm,
  type WebDesignProjectFormValue,
} from "@/components/admin/web-design/WebDesignProjectEditorForm";
import type { WebDesignProject } from "@/types/web-design";

function toFormValue(project: WebDesignProject): WebDesignProjectFormValue {
  return {
    slug: project.slug,
    title: project.title,
    serviceLabel: project.serviceLabel,
    projectNumber: project.projectNumber,
    client: project.client,
    industry: project.industry,
    year: project.year,
    services: project.services,
    descriptionTitle: project.descriptionTitle,
    description: project.description,
    websiteUrl: project.websiteUrl,
    status: project.status,
    order: project.order,
    featured: project.featured,
    coverMediaId: project.coverMediaId,
    coverImageUrl: project.coverImageUrl,
    appearance: project.appearance,
    featuredVisual: project.featuredVisual,
    gallery: project.gallery,
    seo: project.seo,
  };
}

export default function EditWebDesignProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { project, loading, error, refresh } = useWebDesignProjectById(id);
  const [saving, setSaving] = useState(false);

  if (loading) return <p className="text-muted">Duke ngarkuar…</p>;
  if (error || !project) {
    return <p className="text-red-400">{error ?? "Projekti nuk u gjet"}</p>;
  }

  return (
    <WebDesignProjectEditorForm
      key={project.updatedAt}
      initial={toFormValue(project)}
      saving={saving}
      onSave={async (value) => {
        setSaving(true);
        try {
          await getWebDesignProjectRepository().update(id, value);
          await refresh();
        } finally {
          setSaving(false);
        }
      }}
    />
  );
}
