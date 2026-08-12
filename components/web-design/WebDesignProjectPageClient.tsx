"use client";

import Link from "next/link";
import { useWebDesignProjectBySlug } from "@/lib/hooks/useWebDesignProjects";
import { WebDesignProjectRenderer } from "./WebDesignProjectRenderer";

export function WebDesignProjectPageClient({
  slug,
  isPreview,
}: {
  slug: string;
  isPreview: boolean;
}) {
  const { project, loading, error, notFound, totalPublished, publishedIndex } =
    useWebDesignProjectBySlug(slug, isPreview);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#0B0B0C] text-white/40">
        Duke ngarkuar projektin…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl bg-[#0B0B0C] px-5 py-24 text-center text-red-400">
        {error}
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="mx-auto max-w-xl bg-[#0B0B0C] px-5 py-24 text-center text-white">
        <h1 className="text-3xl font-extrabold tracking-[-0.04em]">
          Projekti nuk u gjet
        </h1>
        <p className="mt-3 text-white/45">
          {isPreview
            ? "Nuk ekziston asnjë projekt web design me këtë slug."
            : "Ky projekt nuk është publik ose nuk ekziston. Nëse është draft, hapeni me ?preview=true nga admin."}
        </p>
        <Link
          href="/web-design"
          className="mt-8 inline-block text-white underline underline-offset-4"
        >
          ← Kthehu te Web Design
        </Link>
      </div>
    );
  }

  const index = project.projectNumber ?? publishedIndex;
  const total = Math.max(totalPublished, index);

  return (
    <WebDesignProjectRenderer
      project={project}
      index={index}
      total={total}
      isPreview={isPreview}
    />
  );
}
