"use client";

import Link from "next/link";
import { useSocialMediaProjects } from "@/lib/hooks/useSocialMediaProjects";
import { socialMediaContentClass } from "@/lib/social-media/layout";
import { MediaImage } from "@/components/branding/MediaImage";

export function SocialMediaListClient() {
  const { projects, loading, error } = useSocialMediaProjects();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-[#EAEAEA] pt-[var(--header-offset)] text-neutral-500">
        Duke ngarkuar…
      </div>
    );
  }

  if (error) {
    return (
      <p className="bg-[#EAEAEA] px-5 py-20 text-center text-red-600">{error}</p>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAEAEA] pb-20 pt-[calc(var(--header-offset))] text-neutral-900">
      <div className={socialMediaContentClass}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-600 md:text-xs">
          Portfolio
        </p>
        <h1 className="mt-3 text-[clamp(2.25rem,5vw,4.5rem)] font-extrabold uppercase tracking-[-0.02em] text-neutral-950 [font-family:var(--font-sm-display)]">
          Social Media
        </h1>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const cover = project.block1.feedPosts[0];
            return (
              <Link
                key={project.id}
                href={`/social-media/${project.slug}`}
                className="group block overflow-hidden rounded-[1.25rem] border border-black/[0.07] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.07)] transition hover:shadow-[0_24px_64px_rgba(0,0,0,0.1)]"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-200">
                  <MediaImage
                    mediaId={cover?.mediaId ?? project.block1.mockupImage1MediaId}
                    imageUrl={cover?.imageUrl ?? project.block1.mockupImage1Url}
                    alt={project.clientName}
                    fit="cover"
                    className="transition duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-bold uppercase tracking-[-0.02em] [font-family:var(--font-sm-display)]">
                    {project.clientName}
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    {project.serviceLabel}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {!projects.length ? (
          <p className="mt-10 text-neutral-500">Nuk ka projekte publike ende.</p>
        ) : null}
      </div>
    </div>
  );
}
