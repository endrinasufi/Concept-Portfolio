"use client";

import Link from "next/link";
import { useProjects } from "@/lib/hooks/useProjects";
import { getProjectCover } from "@/lib/utils/projectCover";
import { collectProjectPhotos } from "@/lib/utils/projectPhotos";
import { MediaImage } from "@/components/branding/MediaImage";
import { FadeIn, Reveal } from "@/components/motion/Reveal";
import { sortByOrder } from "@/lib/utils/id";
import type { BrandColor, BrandingProject, Project } from "@/types/branding";
import { motion, useReducedMotion } from "motion/react";
import { Inter } from "next/font/google";
import { useEffect, useMemo, useState } from "react";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

function ColorStrip({ colors }: { colors: BrandColor[] }) {
  const reduce = useReducedMotion();
  const sorted = sortByOrder(colors).slice(0, 5);
  if (!sorted.length) return null;

  return (
    <div className="flex h-2.5 w-full gap-1.5 md:h-3" aria-label="Paleta">
      {sorted.map((c, i) => (
        <motion.span
          key={c.id}
          title={c.hex}
          className="h-full min-w-0 flex-1 rounded-full"
          style={{ backgroundColor: c.hex }}
          initial={reduce ? false : { scaleX: 0, opacity: 0 }}
          whileInView={reduce ? undefined : { scaleX: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            delay: 0.1 + i * 0.06,
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      ))}
    </div>
  );
}

function ProjectCard({ project }: { project: BrandingProject }) {
  const photos = useMemo(() => {
    const all = collectProjectPhotos(project);
    if (all.length) return all;
    const { coverUrl, coverMediaId } = getProjectCover(project);
    if (coverMediaId || coverUrl) {
      return [{ mediaId: coverMediaId, imageUrl: coverUrl }];
    }
    return [];
  }, [project]);

  const reduce = useReducedMotion();
  const [hovering, setHovering] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!hovering || reduce || photos.length < 2) return;
    setIndex((i) => (i + 1) % photos.length);
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
    }, 1050);
    return () => window.clearInterval(id);
  }, [hovering, photos.length, reduce]);

  useEffect(() => {
    if (!hovering) setIndex(0);
  }, [hovering]);

  const current = photos[index] ?? photos[0];
  if (!current) return null;

  return (
    <Link
      href={`/branding/${project.slug}`}
      className="group flex flex-col"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[1.5rem] md:rounded-[1.75rem]">
        {photos.map((photo, i) => (
          <div
            key={`${photo.mediaId ?? photo.imageUrl}-${i}`}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <MediaImage
              mediaId={photo.mediaId}
              imageUrl={photo.imageUrl}
              alt={project.title}
              fit="cover"
              className="h-full w-full object-cover"
            />
          </div>
        ))}
        <div className="pointer-events-none absolute inset-0 bg-black/10 transition duration-500 group-hover:bg-transparent" />
      </div>

      <div className={`mt-5 flex gap-4 md:mt-6 md:gap-5 ${inter.className}`}>
        <div className="min-w-0 flex-1">
          <div className="w-1/2">
            <ColorStrip colors={project.brandColors} />
          </div>

          <h2 className="mt-4 text-xl font-semibold leading-[1.15] tracking-tight text-foreground transition duration-300 group-hover:text-accent md:text-2xl">
            {project.title}
          </h2>

          {project.shortDescription ? (
            <p className="mt-3 line-clamp-2 text-sm font-normal leading-relaxed text-muted md:text-[0.9375rem]">
              {project.shortDescription.replace(/\*\*(.+?)\*\*/g, "$1")}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export function BrandingListClient({
  initialProjects,
}: {
  initialProjects?: Project[];
}) {
  const { projects, loading, error } = useProjects({
    service: "branding",
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
              Branding
            </p>
            <h1 className="font-display mt-4 text-5xl leading-[0.92] tracking-tight md:text-6xl lg:text-7xl">
              Projektet
            </h1>
          </div>
        </FadeIn>

        {loading ? (
          <p className="mt-16 text-muted">Duke ngarkuar projektet…</p>
        ) : error ? (
          <p className="mt-16 text-red-400">{error}</p>
        ) : projects.length === 0 ? (
          <p className="mt-16 text-muted">Nuk ka projekte ende.</p>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2 md:mt-16 md:gap-x-14 md:gap-y-20 lg:gap-x-16 lg:gap-y-24">
            {projects.map((project, i) => (
              <Reveal key={project.id} delay={Math.min(i * 0.05, 0.2)}>
                <div className="h-full border-b border-white/[0.08] pb-10 md:pb-12">
                  <ProjectCard project={project} />
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
