"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSocialMediaProjectRepository } from "@/lib/repositories";
import {
  emptySocialMediaProjectForm,
  SocialMediaProjectEditorForm,
} from "@/components/admin/social-media/SocialMediaProjectEditorForm";

export default function NewSocialMediaProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  return (
    <SocialMediaProjectEditorForm
      initial={emptySocialMediaProjectForm()}
      saving={saving}
      onSave={async (value) => {
        setSaving(true);
        try {
          const created = await getSocialMediaProjectRepository().create({
            ...value,
            service: "social-media",
          });
          router.push(`/admin/social-media/${created.id}`);
        } finally {
          setSaving(false);
        }
      }}
    />
  );
}
