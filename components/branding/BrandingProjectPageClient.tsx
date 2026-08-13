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
        Duke ngarkuar projektin…
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
        <h1 className="font-display text-3xl">Projekti nuk u gjet</h1>
        <p className="mt-3 text-muted">
          {isPreview
            ? "Nuk ekziston asnjë projekt me këtë slug."
            : "Ky projekt nuk është publik ose nuk ekziston. Nëse është draft, hapeni me ?preview=true nga admin."}
        </p>
        <Link href="/branding" className="mt-8 inline-block text-accent hover:underline">
          ← Kthehu te branding
        </Link>
      </div>
    );
  }

  return <ServiceProjectRenderer project={project} isPreview={isPreview} />;
}
