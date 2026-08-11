"use client";

import type { BrandingProject } from "@/types/branding";
import { BrandingBentoIntro } from "./BrandingBentoIntro";
import { ProjectPhotoMosaic } from "./ProjectPhotoMosaic";
import { EditorialGallery } from "./ProjectSectionRenderer";
import { ProjectVideo } from "./ProjectVideo";
import { useEffect, type CSSProperties } from "react";

export function BrandingProjectRenderer({
  project,
  isPreview = false,
}: {
  project: BrandingProject;
  isPreview?: boolean;
}) {
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

      <div className="relative z-[1] mx-auto max-w-7xl px-5 pb-10 pt-[var(--header-offset)] md:px-8 md:pb-14">
        {isPreview && project.status === "draft" ? (
          <div className="mb-6 inline-flex rounded-full border border-accent/40 bg-accent-soft px-3 py-1 text-xs uppercase tracking-[0.2em] text-accent">
            Preview · Draft
          </div>
        ) : null}

        <BrandingBentoIntro project={project} />

        <ProjectPhotoMosaic project={project} />

        <EditorialGallery project={project} />

        <ProjectVideo videoMediaId={project.videoMediaId} />
      </div>
    </article>
  );
}
