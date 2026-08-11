"use client";

import type { BrandingProject } from "@/types/branding";
import { sortByOrder } from "@/lib/utils/id";
import { BrandingBentoIntro } from "./BrandingBentoIntro";
import { EditorialGallery, ProjectSectionRenderer } from "./ProjectSectionRenderer";
import { Reveal } from "@/components/motion/Reveal";
import { useEffect, type CSSProperties } from "react";

export function BrandingProjectRenderer({
  project,
  isPreview = false,
}: {
  project: BrandingProject;
  isPreview?: boolean;
}) {
  const sections = sortByOrder(project.sections);

  useEffect(() => {
    const root = document.documentElement;
    const bg2 =
      project.secondaryBackgroundColor || project.primaryBackgroundColor;
    root.style.setProperty("--project-bg", project.primaryBackgroundColor);
    root.style.setProperty("--project-bg-2", bg2);
    return () => {
      root.style.removeProperty("--project-bg");
      root.style.removeProperty("--project-bg-2");
    };
  }, [project]);

  const bg2 =
    project.secondaryBackgroundColor || project.primaryBackgroundColor;

  return (
    <article
      className="project-shell editorial-grain min-h-screen"
      style={
        {
          ["--project-bg" as string]: project.primaryBackgroundColor,
          ["--project-bg-2" as string]: bg2,
        } as CSSProperties
      }
    >
      <div className="project-atmosphere" aria-hidden>
        <span className="project-atmosphere__orb project-atmosphere__orb--a" />
        <span className="project-atmosphere__orb project-atmosphere__orb--b" />
        <span className="project-atmosphere__orb project-atmosphere__orb--c" />
      </div>

      <div className="relative z-[1] mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        {isPreview && project.status === "draft" ? (
          <div className="mb-6 inline-flex rounded-full border border-accent/40 bg-accent-soft px-3 py-1 text-xs uppercase tracking-[0.2em] text-accent">
            Preview · Draft
          </div>
        ) : null}

        <BrandingBentoIntro project={project} />

        <div className="mt-16 space-y-16 md:mt-24 md:space-y-24">
          {sections.map((section, index) => (
            <Reveal key={section.id} delay={Math.min(index * 0.04, 0.2)}>
              <ProjectSectionRenderer section={section} project={project} />
            </Reveal>
          ))}
        </div>

        <EditorialGallery project={project} />
      </div>
    </article>
  );
}
