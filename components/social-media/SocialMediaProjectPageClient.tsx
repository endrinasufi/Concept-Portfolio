"use client";

import Link from "next/link";
import { useSocialMediaProjectBySlug } from "@/lib/hooks/useSocialMediaProjects";
import { SocialMediaProjectRenderer } from "./SocialMediaProjectRenderer";

export function SocialMediaProjectPageClient({
  slug,
  isPreview,
  initialProject,
}: {
  slug: string;
  isPreview: boolean;
  initialProject?: import("@/types/social-media").SocialMediaProject | null;
}) {
  const { project, loading, error, notFound } = useSocialMediaProjectBySlug(
    slug,
    isPreview,
    initialProject,
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#EAEAEA] text-neutral-500">
        Loading project…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl bg-[#EAEAEA] px-5 py-24 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="mx-auto max-w-xl bg-[#EAEAEA] px-5 py-24 text-center text-neutral-900">
        <h1 className="text-3xl font-bold uppercase [font-family:var(--font-sm-display)]">
          Project not found
        </h1>
        <p className="mt-3 text-neutral-500">
          {isPreview
            ? "No social media project exists with this slug."
            : "This project is not published or does not exist. If it is a draft, open it with ?preview=true from admin."}
        </p>
        <Link
          href="/social-media"
          className="mt-8 inline-block font-medium text-neutral-900 underline underline-offset-4"
        >
          ← Back to Social Media
        </Link>
      </div>
    );
  }

  return <SocialMediaProjectRenderer project={project} isPreview={isPreview} />;
}
