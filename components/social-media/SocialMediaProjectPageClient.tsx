"use client";

import Link from "next/link";
import { useEffect } from "react";
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

  const pageBg = project?.pageAppearance.backgroundColor || "#EAEAEA";

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--project-bg", pageBg);
    return () => {
      root.style.removeProperty("--project-bg");
    };
  }, [pageBg]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#EAEAEA] text-neutral-500">
        Duke ngarkuar projektin…
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
        <h1 className="font-page-title text-3xl">
          Projekti nuk u gjet
        </h1>
        <p className="mt-3 text-neutral-500">
          {isPreview
            ? "Nuk ekziston asnjë projekt social media me këtë slug."
            : "Ky projekt nuk është publik ose nuk ekziston. Nëse është draft, hapeni me ?preview=true nga admin."}
        </p>
        <Link
          href="/social-media"
          className="mt-8 inline-block font-medium text-neutral-900 underline underline-offset-4"
        >
          ← Kthehu te Social Media
        </Link>
      </div>
    );
  }

  return <SocialMediaProjectRenderer project={project} isPreview={isPreview} />;
}
