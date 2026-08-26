"use client";

import type { BrandingProject } from "@/types/branding";
import { getMosaicPhotos, type ProjectPhoto } from "@/lib/utils/projectPhotos";
import { MOSAIC_SLOTS } from "@/lib/branding/mosaicLayout";
import { getProjectCover } from "@/lib/utils/projectCover";
import { MediaImage } from "./MediaImage";
import { Reveal } from "@/components/motion/Reveal";
import { useMemo } from "react";

const DEFAULT_LOGO_BG = "#1c1c20";

function EmphasisHeadline({ text }: { text: string }) {
  const raw = text.trim();
  if (!raw) return null;

  const parts: { bold: boolean; text: string }[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(raw)) !== null) {
    if (match.index > last) {
      parts.push({ bold: false, text: raw.slice(last, match.index) });
    }
    parts.push({ bold: true, text: match[1] });
    last = match.index + match[0].length;
  }
  if (last < raw.length) {
    parts.push({ bold: false, text: raw.slice(last) });
  }
  if (!parts.length) {
    parts.push({ bold: false, text: raw });
  }

  return (
    <h2 className="w-full line-clamp-2 text-justify text-xl font-extralight leading-[1.25] tracking-tight text-foreground/80 md:text-2xl md:leading-[1.3] lg:text-[1.75rem]">
      {parts.map((part, i) =>
        part.bold ? (
          <span key={i} className="font-medium text-foreground/95">
            {part.text}
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </h2>
  );
}

function MosaicTile({
  photo,
  className,
}: {
  photo: ProjectPhoto;
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-[1.35rem] bg-surface md:rounded-[1.6rem] ${className ?? ""}`}
    >
      <MediaImage
        mediaId={photo.mediaId}
        imageUrl={photo.imageUrl}
        alt=""
        fit="cover"
      />
    </div>
  );
}

function LogoTile({
  project,
  className,
}: {
  project: BrandingProject;
  className?: string;
}) {
  const { logoUrl } = getProjectCover(project);
  const logoBg = project.logoBackgroundColor || DEFAULT_LOGO_BG;

  return (
    <div
      className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-[1.35rem] p-4 md:rounded-[1.6rem] md:p-5 ${className ?? ""}`}
      style={{ backgroundColor: logoBg }}
    >
      <MediaImage
        mediaId={project.logoMediaId}
        imageUrl={logoUrl}
        alt={`${project.title} logo`}
        fit="contain"
        className="max-h-[55%] max-w-[70%] opacity-95"
      />
    </div>
  );
}

export function ProjectPhotoMosaic({ project }: { project: BrandingProject }) {
  const photos = useMemo(() => getMosaicPhotos(project), [project]);
  const hasPhoto = photos.some(Boolean);

  if (!hasPhoto && !project.logoMediaId) return null;

  const headline =
    project.shortDescription?.trim() ||
    project.coverHeadline?.trim() ||
    project.title;

  return (
    <Reveal>
      <section id="projekt" className="mt-16 w-full scroll-mt-28 md:mt-24">
        <EmphasisHeadline text={headline} />

        {project.brandAbout?.trim() ? (
          <p className="mt-4 w-full whitespace-pre-line text-justify text-[calc(0.75rem+2pt)] font-light leading-[1.65] tracking-wide text-foreground/50 md:mt-5 md:text-[calc(0.8125rem+2pt)] md:leading-[1.7]">
            {project.brandAbout.trim()}
          </p>
        ) : null}

        <div className="mt-8 grid w-full grid-cols-4 gap-5 sm:mt-10 sm:grid-cols-7 sm:grid-rows-2 sm:gap-7 md:gap-9 lg:gap-11">
          {MOSAIC_SLOTS.map((slot, i) => {
            if (slot.type === "logo") {
              return (
                <LogoTile
                  key={`logo-${i}`}
                  project={project}
                  className={slot.className}
                />
              );
            }

            const photo = photos[slot.photoIndex];
            if (!photo) return null;

            return (
              <MosaicTile
                key={`photo-${slot.photoIndex}`}
                photo={photo}
                className={slot.className}
              />
            );
          })}
        </div>
      </section>
    </Reveal>
  );
}
