"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePhotoshootingProjects } from "@/lib/hooks/usePhotoshooting";
import { FadeIn, Reveal } from "@/components/motion/Reveal";
import { useResolvedSrc } from "@/lib/hooks/useMediaUrl";
import { Inter } from "next/font/google";
import type { PhotoshootingProject } from "@/types/photoshooting";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

function ProjectCard({ project }: { project: PhotoshootingProject }) {
  const src = useResolvedSrc({
    mediaId: project.coverMediaId,
    imageUrl: project.coverImageUrl,
  });

  return (
    <Link href={`/photoshooting/${project.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-surface md:rounded-[1.75rem]">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={project.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-black/10 transition duration-500 group-hover:bg-transparent" />
      </div>
      <div className={`mt-5 ${inter.className}`}>
        <h2 className="text-xl font-semibold tracking-tight transition group-hover:text-accent md:text-2xl">
          {project.title}
        </h2>
        <p className="mt-1.5 text-sm text-muted">
          {project.clientName}
          {project.year ? ` · ${project.year}` : ""}
        </p>
      </div>
    </Link>
  );
}

export function PhotoshootingListClient({
  initialProjects,
}: {
  initialProjects?: PhotoshootingProject[];
}) {
  const { projects, loading, error } = usePhotoshootingProjects({
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
            <p className="text-[11px] uppercase tracking-[0.32em] text-accent">
              Photoshooting
            </p>
            <h1 className="font-display mt-4 text-5xl leading-[0.92] tracking-tight md:text-6xl lg:text-7xl">
              Projekte
            </h1>
          </div>
        </FadeIn>

        {loading ? (
          <p className="mt-16 text-muted">Duke ngarkuar…</p>
        ) : error ? (
          <p className="mt-16 text-red-400">{error}</p>
        ) : projects.length === 0 ? (
          <p className="mt-16 text-muted">Nuk ka projekte ende.</p>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 md:mt-16 md:gap-x-14 md:gap-y-20">
            {projects.map((project, i) => (
              <Reveal key={project.id} delay={Math.min(i * 0.05, 0.2)}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
