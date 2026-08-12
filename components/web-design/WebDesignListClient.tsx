"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useWebDesignProjects } from "@/lib/hooks/useWebDesignProjects";
import { MediaImage } from "@/components/branding/MediaImage";
import { FadeIn, Reveal } from "@/components/motion/Reveal";
import type { WebDesignProject } from "@/types/web-design";

function WebDesignProjectCard({
  project,
  index,
}: {
  project: WebDesignProject;
  index: number;
}) {
  const reduce = useReducedMotion();
  const [hovering, setHovering] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const v = project.featuredVisual;
  const hasDesktop = Boolean(v.desktopMediaId || v.desktopImageUrl);
  const hasCover = Boolean(project.coverMediaId || project.coverImageUrl);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (!hovering || reduce || !hasDesktop) {
      const reset = window.setTimeout(() => {
        if (el) el.scrollTop = 0;
      }, 750);
      return () => window.clearTimeout(reset);
    }

    el.scrollTop = 0;
    let frame = 0;
    let last = performance.now();
    let paused = false;

    const tick = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;
      if (!paused) {
        const max = el.scrollHeight - el.clientHeight;
        if (max > 0) {
          el.scrollTop = Math.min(max, el.scrollTop + dt * 0.085);
          if (el.scrollTop >= max - 1) paused = true;
        }
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [hovering, reduce, hasDesktop]);

  const meta = [
    String(project.projectNumber ?? index + 1).padStart(2, "0"),
    project.year,
    project.client,
  ]
    .filter(Boolean)
    .join(" · ");

  const showScroll = hovering && hasDesktop;

  return (
    <Link
      href={`/web-design/${project.slug}`}
      className="group flex flex-col"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[1.5rem] bg-white/[0.04] md:rounded-[1.75rem]">
        {/* Cover — fade out on hover */}
        <div
          className={`absolute inset-0 z-[1] transition-opacity duration-700 ease-in-out ${
            showScroll ? "opacity-0" : "opacity-100"
          }`}
        >
          {hasCover || hasDesktop ? (
            <MediaImage
              mediaId={
                project.coverMediaId ??
                (!hasCover ? v.desktopMediaId : undefined)
              }
              imageUrl={
                project.coverImageUrl ??
                (!hasCover
                  ? v.desktopImageUrl ?? v.backgroundImageUrl
                  : undefined)
              }
              alt={project.title}
              fit="cover"
            />
          ) : (
            <div className="absolute inset-0 bg-white/[0.06]" />
          )}
        </div>

        {/* Desktop mockup — fade in + auto scroll */}
        {hasDesktop ? (
          <div
            ref={scrollRef}
            className={`absolute inset-0 z-[2] overflow-y-auto overscroll-none transition-opacity duration-700 ease-in-out [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
              showScroll ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={!showScroll}
          >
            <MediaImage
              mediaId={v.desktopMediaId}
              imageUrl={v.desktopImageUrl}
              alt=""
              className="block h-auto w-full max-w-none"
            />
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-0 z-[3] bg-black/10 transition-opacity duration-700 ease-in-out group-hover:opacity-0" />
      </div>

      <div className="mt-5 md:mt-6">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
          {meta || project.serviceLabel}
        </p>

        <h2 className="mt-3 text-xl font-semibold leading-[1.15] tracking-tight text-white transition duration-300 group-hover:text-white/75 md:text-2xl">
          {project.title}
        </h2>

        {project.description ? (
          <p className="mt-3 line-clamp-2 text-sm font-normal leading-relaxed text-white/50 md:text-[0.9375rem]">
            {project.description}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export function WebDesignListClient() {
  const { projects, loading, error } = useWebDesignProjects();

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
              Web Design
            </p>
            <h1 className="font-display mt-4 text-5xl leading-[0.92] tracking-tight md:text-6xl lg:text-7xl">
              Projektet
            </h1>
          </div>
        </FadeIn>

        {loading ? (
          <p className="mt-16 text-white/45">Duke ngarkuar projektet…</p>
        ) : error ? (
          <p className="mt-16 text-red-400">{error}</p>
        ) : projects.length === 0 ? (
          <p className="mt-16 text-white/45">Nuk ka projekte ende.</p>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2 md:mt-16 md:gap-x-14 md:gap-y-20 lg:gap-x-16 lg:gap-y-24">
            {projects.map((project, i) => (
              <Reveal key={project.id} delay={Math.min(i * 0.05, 0.2)}>
                <div className="h-full border-b border-white/[0.08] pb-10 md:pb-12">
                  <WebDesignProjectCard project={project} index={i} />
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
