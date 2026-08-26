"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSocialMediaProjects } from "@/lib/hooks/useSocialMediaProjects";
import { MediaImage } from "@/components/branding/MediaImage";
import { FadeIn, Reveal } from "@/components/motion/Reveal";
import type { SocialMediaProject } from "@/types/social-media";

function coverOf(project: SocialMediaProject) {
  return {
    mediaId:
      project.coverMediaId ??
      project.block1.feedPosts[0]?.mediaId ??
      project.block1.mockupImage1MediaId,
    imageUrl:
      project.coverImageUrl ??
      project.block1.feedPosts[0]?.imageUrl ??
      project.block1.mockupImage1Url,
  };
}

function SocialMediaProjectCard({
  project,
}: {
  project: SocialMediaProject;
}) {
  const cover = coverOf(project);

  return (
    <Link href={`/social-media/${project.slug}`} className="group flex flex-col">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.15rem] bg-white/[0.04] md:rounded-[1.35rem]">
        {cover.mediaId || cover.imageUrl ? (
          <MediaImage
            mediaId={cover.mediaId}
            imageUrl={cover.imageUrl}
            alt={project.clientName || project.title}
            fit="cover"
            className="transition duration-700 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="absolute inset-0 bg-white/[0.06]" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-black/10 transition duration-500 group-hover:bg-transparent" />
      </div>

      <div className="mt-3.5 md:mt-4">
        <h2 className="text-lg font-semibold leading-[1.15] tracking-tight text-white transition duration-300 group-hover:text-white/75 md:text-xl">
          {project.clientName || project.title}
        </h2>

        {project.title && project.clientName && project.title !== project.clientName ? (
          <p className="mt-2 line-clamp-2 text-sm font-normal leading-relaxed text-white/50">
            {project.title}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export function SocialMediaListClient({
  initialProjects,
}: {
  initialProjects?: SocialMediaProject[];
}) {
  const { projects, loading, error } = useSocialMediaProjects({
    enabled: initialProjects === undefined,
    initial: initialProjects,
  });

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--project-bg", "#0E0F11");
    return () => {
      root.style.removeProperty("--project-bg");
    };
  }, []);

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: "#0E0F11" }}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] opacity-80"
        style={{
          background:
            "radial-gradient(70% 50% at 50% -10%, rgba(212,165,116,0.14), transparent 60%)",
        }}
        aria-hidden
      />

      <div className="relative z-[1] mx-auto max-w-7xl px-5 pb-24 pt-[var(--header-offset)] md:px-8">
        <FadeIn>
          <div className="max-w-3xl border-b border-white/[0.08] pb-12 md:pb-16">
            <h1 className="font-page-title text-6xl md:text-7xl lg:text-8xl">
              Social Media
            </h1>
          </div>
        </FadeIn>

        {loading ? (
          <p className="mt-16 text-white/45">Loading projects…</p>
        ) : error ? (
          <p className="mt-16 text-red-400">{error}</p>
        ) : projects.length === 0 ? (
          <p className="mt-16 text-white/45">No projects yet.</p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 sm:gap-y-12 md:mt-14 md:grid-cols-3 md:gap-x-8 md:gap-y-14 lg:gap-x-10 lg:gap-y-16">
            {projects.map((project, i) => (
              <Reveal key={project.id} delay={Math.min(i * 0.05, 0.2)}>
                <div className="h-full border-b border-white/[0.08] pb-6 md:pb-8">
                  <SocialMediaProjectCard project={project} />
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
