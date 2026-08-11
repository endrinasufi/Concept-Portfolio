"use client";

import type { BrandingProject } from "@/types/branding";
import { getProjectCover } from "@/lib/utils/projectCover";
import { contrastingInk, mutedInk } from "@/lib/utils/colorContrast";
import { MediaImage } from "./MediaImage";
import { CoverHeroPanel } from "./CoverHeroPanel";
import { ColorPills } from "./ColorPills";
import { Reveal } from "@/components/motion/Reveal";

const DEFAULT_PANEL = "#1c1c20";

export function BrandingBentoIntro({ project }: { project: BrandingProject }) {
  const { logoUrl, coverUrl, coverMediaId, mockupUrl, mockupMediaId } =
    getProjectCover(project);

  const logoBg = project.logoBackgroundColor || DEFAULT_PANEL;
  const industryBg = project.industryBackgroundColor || DEFAULT_PANEL;
  const servicesBg = project.servicesBackgroundColor || DEFAULT_PANEL;

  return (
    <Reveal className="block">
      <div className="flex flex-col gap-4 lg:min-h-[70vh] lg:flex-row lg:items-stretch lg:gap-5">
        {/* Left column — logo + tall mockup */}
        <div className="flex w-full flex-col gap-4 lg:w-[22%] lg:min-w-[12rem] lg:max-w-[18rem] lg:self-stretch">
          <div
            className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[var(--radius-xl)] p-8 md:aspect-auto md:min-h-[10rem]"
            style={{ backgroundColor: logoBg }}
          >
            <MediaImage
              mediaId={project.logoMediaId}
              imageUrl={logoUrl}
              alt={`${project.title} logo`}
              fit="contain"
              className="max-h-24 opacity-95 md:max-h-28"
            />
          </div>
          <div className="relative min-h-[18rem] flex-1 overflow-hidden rounded-[var(--radius-xl)] bg-surface lg:min-h-0">
            <MediaImage
              mediaId={mockupMediaId}
              imageUrl={mockupUrl}
              alt="Mockup"
              fit="cover"
              className="transition duration-700 hover:scale-[1.03]"
            />
          </div>
        </div>

        {/* Center — stretches into remaining space */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 lg:self-stretch">
          <CoverHeroPanel
            project={project}
            coverMediaId={coverMediaId}
            coverUrl={coverUrl}
            className="min-h-[22rem] flex-1 lg:min-h-0"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div
              className="rounded-[var(--radius-lg)] p-5"
              style={{
                backgroundColor: industryBg,
                color: contrastingInk(industryBg),
              }}
            >
              <p
                className="text-xs uppercase tracking-[0.2em]"
                style={{ color: mutedInk(industryBg) }}
              >
                Industria
              </p>
              <p className="mt-2 text-lg">{project.industry}</p>
            </div>
            <div
              className="rounded-[var(--radius-lg)] p-5"
              style={{
                backgroundColor: servicesBg,
                color: contrastingInk(servicesBg),
              }}
            >
              <p
                className="text-xs uppercase tracking-[0.2em]"
                style={{ color: mutedInk(servicesBg) }}
              >
                Shërbimet
              </p>
              <p className="mt-2 text-sm leading-relaxed opacity-90">
                {project.services.join(" · ")}
              </p>
            </div>
          </div>
        </div>

        {/* Right — narrow palette stretched to full section height */}
        <div className="hidden lg:flex lg:shrink-0 lg:self-stretch">
          <ColorPills
            colors={project.brandColors}
            orientation="vertical"
            className="h-full min-h-full"
          />
        </div>

        {/* Tablet / mobile palette */}
        <ColorPills
          colors={project.brandColors}
          orientation="horizontal"
          className="min-h-20 w-full lg:hidden"
        />
      </div>
    </Reveal>
  );
}
