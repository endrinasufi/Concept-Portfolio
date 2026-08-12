"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getWebDesignProjectRepository } from "@/lib/repositories";
import {
  emptyWebDesignProjectForm,
  WebDesignProjectEditorForm,
} from "@/components/admin/web-design/WebDesignProjectEditorForm";

export default function NewWebDesignProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  return (
    <WebDesignProjectEditorForm
      initial={emptyWebDesignProjectForm()}
      saving={saving}
      onSave={async (value) => {
        setSaving(true);
        try {
          const created = await getWebDesignProjectRepository().create({
            ...value,
            service: "web-design",
          });
          router.push(`/admin/web-design/${created.id}`);
        } finally {
          setSaving(false);
        }
      }}
    />
  );
}
