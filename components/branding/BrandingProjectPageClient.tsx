"use client";

import Link from "next/link";
import { useProjectBySlug } from "@/lib/hooks/useProjects";
import { ServiceProjectRenderer } from "@/components/portfolio/ServiceProjectRenderer";
import type { Project } from "@/types/branding";

export function BrandingProjectPageClient({
  slug,
  isPreview,
  initialProject,
}: {
  slug: string;
  isPreview: boolean;
  initialProject?: Project | null;
}) {
  const { project, loading, error, notFound } = useProjectBySlug(
    slug,
    isPreview,
    initialProject,
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted">
        Loading project…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="font-display text-3xl">Project not found</h1>
        <p className="mt-3 text-muted">
          {isPreview
            ? "No project exists with this slug."
            : "This project is not published or does not exist. If it is a draft, open it with ?preview=true from admin."}
        </p>
        <Link href="/branding" className="mt-8 inline-block text-accent hover:underline">
          ← Back to branding
        </Link>
      </div>
    );
  }

  return <ServiceProjectRenderer project={project} isPreview={isPreview} />;
}
