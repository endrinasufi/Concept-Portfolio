"use client";

import Link from "next/link";
import { useWebDesignProjectBySlug } from "@/lib/hooks/useWebDesignProjects";
import { WebDesignProjectRenderer } from "./WebDesignProjectRenderer";

export function WebDesignProjectPageClient({
  slug,
  isPreview,
  initialProject,
  initialPublished,
}: {
  slug: string;
  isPreview: boolean;
  initialProject?: import("@/types/web-design").WebDesignProject | null;
  initialPublished?: import("@/types/web-design").WebDesignProject[];
}) {
  const { project, loading, error, notFound, totalPublished, publishedIndex } =
    useWebDesignProjectBySlug(
      slug,
      isPreview,
      initialProject,
      initialPublished,
    );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#0B0B0C] text-white/40">
        Loading project…
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
          Project not found
        </h1>
        <p className="mt-3 text-white/45">
          {isPreview
            ? "No web design project exists with this slug."
            : "This project is not published or does not exist. If it is a draft, open it with ?preview=true from admin."}
        </p>
        <Link
          href="/web-design"
          className="mt-8 inline-block text-white underline underline-offset-4"
        >
          ← Back to Web Design
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
