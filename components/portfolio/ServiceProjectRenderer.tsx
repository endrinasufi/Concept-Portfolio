"use client";

import type { Project } from "@/types/branding";
import { BrandingProjectRenderer } from "@/components/branding/BrandingProjectRenderer";

export function ServiceProjectRenderer({
  project,
  isPreview = false,
}: {
  project: Project;
  isPreview?: boolean;
}) {
  switch (project.service) {
    case "branding":
      return <BrandingProjectRenderer project={project} isPreview={isPreview} />;
    default:
      return (
        <div className="mx-auto max-w-3xl px-5 py-24 text-center text-muted">
          This service is not available yet.
        </div>
      );
  }
}
