"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePhotoshootingBySlug } from "@/lib/hooks/usePhotoshooting";
import { PhotoshootingBentoGrid } from "@/components/photoshooting/PhotoshootingBentoGrid";
import { FadeIn } from "@/components/motion/Reveal";
import { Inter } from "next/font/google";
import type { PhotoshootingProject } from "@/types/photoshooting";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export function PhotoshootingProjectPageClient({
  slug,
  isPreview = false,
  initialProject,
}: {
  slug: string;
  isPreview?: boolean;
  initialProject?: PhotoshootingProject | null;
}) {
  const { project, loading, error, notFound } = usePhotoshootingBySlug(
    slug,
    isPreview,
    initialProject,
  );

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--project-bg", "#0E0F11");
    return () => {
      root.style.removeProperty("--project-bg");
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted">
        Duke ngarkuar…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center text-red-400">
        {error}
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="font-display text-3xl">Projekti nuk u gjet</h1>
        <Link href="/photoshooting" className="mt-8 inline-block text-accent hover:underline">
          ← Kthehu te Photoshooting
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: "#0E0F11" }}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[50vh] opacity-70"
        style={{
          background:
            "radial-gradient(60% 45% at 50% -5%, rgba(212,165,116,0.12), transparent 65%)",
        }}
        aria-hidden
      />

      <article className="relative z-[1] mx-auto max-w-7xl px-5 pb-24 pt-[var(--header-offset)] md:px-8 md:pb-32">
        <FadeIn>
          <header className="mb-10 max-w-3xl border-b border-white/[0.08] pb-10 md:mb-14 md:pb-12">
            <p className="text-[11px] uppercase tracking-[0.32em] text-accent">
              Photoshooting
            </p>
            <h1 className="font-display mt-4 text-4xl leading-[0.95] tracking-tight md:text-6xl lg:text-7xl">
              {project.title}
            </h1>
            <p className={`mt-4 text-sm text-muted md:text-base ${inter.className}`}>
              {project.clientName}
              {project.year ? ` · ${project.year}` : ""}
            </p>
            {project.shortDescription ? (
              <p
                className={`mt-4 max-w-xl text-sm leading-relaxed text-muted md:text-[0.9375rem] ${inter.className}`}
              >
                {project.shortDescription}
              </p>
            ) : null}
          </header>
        </FadeIn>

        <PhotoshootingBentoGrid cells={project.cells} />

        <div className={`mt-14 ${inter.className}`}>
          <Link
            href="/photoshooting"
            className="text-sm text-muted transition hover:text-accent"
          >
            ← Të gjitha projektet
          </Link>
        </div>
      </article>
    </div>
  );
}
