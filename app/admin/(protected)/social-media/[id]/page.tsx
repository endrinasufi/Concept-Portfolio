"use client";

import { use, useState } from "react";
import { useSocialMediaProjectById } from "@/lib/hooks/useSocialMediaProjects";
import { getSocialMediaProjectRepository } from "@/lib/repositories";
import {
  SocialMediaProjectEditorForm,
  type SocialMediaProjectFormValue,
} from "@/components/admin/social-media/SocialMediaProjectEditorForm";
import type { SocialMediaProject } from "@/types/social-media";

function toFormValue(project: SocialMediaProject): SocialMediaProjectFormValue {
  return {
    slug: project.slug,
    title: project.title,
    clientName: project.clientName,
    serviceLabel: project.serviceLabel,
    usernames: project.usernames,
    status: project.status,
    order: project.order,
    coverMediaId: project.coverMediaId,
    coverImageUrl: project.coverImageUrl,
    pageAppearance: project.pageAppearance,
    block1: project.block1,
    block2: project.block2,
    block3: project.block3,
    seo: project.seo,
  };
}

export default function EditSocialMediaProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { project, loading, error, refresh } = useSocialMediaProjectById(id);
  const [saving, setSaving] = useState(false);

  if (loading) return <p className="text-muted">Duke ngarkuar…</p>;
  if (error || !project) {
    return <p className="text-red-400">{error ?? "Projekti nuk u gjet"}</p>;
  }

  return (
    <SocialMediaProjectEditorForm
      key={project.updatedAt}
      initial={toFormValue(project)}
      saving={saving}
      onSave={async (value) => {
        setSaving(true);
        try {
          await getSocialMediaProjectRepository().update(id, value);
          await refresh();
        } finally {
          setSaving(false);
        }
      }}
    />
  );
}
