"use client";

import type { BrandingProject, BrandingSection, TypographyItem } from "@/types/branding";
import { MediaImage } from "./MediaImage";
import { ColorPills } from "./ColorPills";
import { Reveal } from "@/components/motion/Reveal";
import { sortByOrder } from "@/lib/utils/id";

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function TextBlock({
  heading,
  body,
}: {
  heading?: string;
  body?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl py-4">
      {heading ? (
        <h2 className="font-display text-3xl md:text-4xl tracking-tight">{heading}</h2>
      ) : null}
      {body ? (
        <p className="mt-4 text-lg leading-relaxed text-muted">{body}</p>
      ) : null}
    </div>
  );
}

function TypographyBlock({ items }: { items: TypographyItem[] }) {
  const sorted = items.length ? items : [];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sorted.map((t) => (
        <div
          key={t.id}
          className="rounded-[var(--radius-lg)] border border-border bg-surface/60 p-6 md:p-8"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-muted">{t.role}</p>
          <p className="mt-1 text-sm text-accent">{t.fontName} · {t.fontWeight}</p>
          <p
            className="mt-6 text-3xl md:text-4xl leading-tight"
            style={{
              fontFamily: `"${t.fontName}", var(--font-display), serif`,
              fontWeight: Number(t.fontWeight) || 500,
            }}
          >
            {t.sampleText}
          </p>
        </div>
      ))}
    </div>
  );
}

export function ProjectSectionRenderer({
  section,
  project,
}: {
  section: BrandingSection;
  project: BrandingProject;
}) {
  const c = section.content;
  const settings = section.settings;

  switch (section.type) {
    case "text":
      return (
        <TextBlock heading={asString(c.heading)} body={asString(c.body)} />
      );
    case "logo":
      return (
        <div className="flex justify-center py-8">
          <MediaImage
            mediaId={asString(c.mediaId) || project.logoMediaId}
            imageUrl={asString(c.imageUrl) || undefined}
            alt="Logo"
            className="max-h-28 object-contain"
          />
        </div>
      );
    case "image":
    case "mockup":
    case "brandApplication":
      return (
        <figure>
          <div className="overflow-hidden rounded-[var(--radius-xl)]">
            <MediaImage
              mediaId={asString(c.mediaId) || undefined}
              imageUrl={asString(c.imageUrl) || undefined}
              alt={asString(c.caption, section.type)}
              className="w-full aspect-[16/10] object-cover transition duration-700 hover:scale-[1.02]"
              objectPosition={`${Number(settings.objectPositionX ?? 50)}% ${Number(settings.objectPositionY ?? 50)}%`}
            />
          </div>
          {asString(c.caption) ? (
            <figcaption className="mt-3 text-sm text-muted">{asString(c.caption)}</figcaption>
          ) : null}
        </figure>
      );
    case "fullWidthImage":
      return (
        <div className="overflow-hidden rounded-[var(--radius-xl)] -mx-1 md:mx-0">
          <MediaImage
            mediaId={asString(c.mediaId) || undefined}
            imageUrl={asString(c.imageUrl) || undefined}
            alt={asString(c.caption, "Full width")}
            className="w-full max-h-[70vh] object-cover"
          />
        </div>
      );
    case "imageGrid2":
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {["A", "B"].map((key) => (
            <div key={key} className="overflow-hidden rounded-[var(--radius-lg)]">
              <MediaImage
                mediaId={asString(c[`mediaId${key}`]) || undefined}
                imageUrl={asString(c[`imageUrl${key}`]) || undefined}
                alt={`Grid ${key}`}
                className="aspect-[4/5] w-full object-cover transition duration-700 hover:scale-[1.03]"
              />
            </div>
          ))}
        </div>
      );
    case "imageGrid3":
      return (
        <div className="grid gap-4 sm:grid-cols-3">
          {["A", "B", "C"].map((key) => (
            <div key={key} className="overflow-hidden rounded-[var(--radius-lg)]">
              <MediaImage
                mediaId={asString(c[`mediaId${key}`]) || undefined}
                imageUrl={asString(c[`imageUrl${key}`]) || undefined}
                alt={`Grid ${key}`}
                className="aspect-square w-full object-cover transition duration-700 hover:scale-[1.03]"
              />
            </div>
          ))}
        </div>
      );
    case "typography":
      return <TypographyBlock items={project.typography} />;
    case "colorPalette":
      return (
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.22em] text-muted">Paleta</p>
          <ColorPills
            colors={project.brandColors}
            orientation="horizontal"
            className="min-h-28 w-full md:min-h-36"
          />
        </div>
      );
    case "video": {
      const url = asString(c.url);
      return (
        <div className="overflow-hidden rounded-[var(--radius-xl)] bg-surface">
          {url ? (
            <div className="aspect-video w-full">
              <iframe
                src={url}
                title={asString(c.caption, "Video")}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center text-muted">
              Nuk ka video
            </div>
          )}
          {asString(c.caption) ? (
            <p className="p-4 text-sm text-muted">{asString(c.caption)}</p>
          ) : null}
        </div>
      );
    }
    case "spacer":
      return (
        <div
          aria-hidden
          style={{ height: Number(settings.height ?? 64) }}
        />
      );
    case "gallery": {
      const mediaIds = Array.isArray(c.mediaIds) ? (c.mediaIds as string[]) : [];
      const urls = Array.isArray(c.imageUrls) ? (c.imageUrls as string[]) : [];
      return (
        <div className="columns-1 gap-4 sm:columns-2 md:columns-3">
          {mediaIds.map((id, i) => (
            <div key={id} className="mb-4 break-inside-avoid overflow-hidden rounded-[var(--radius-md)]">
              <MediaImage mediaId={id} alt={`Gallery ${i + 1}`} className="w-full object-cover" />
            </div>
          ))}
          {urls.map((url, i) => (
            <div key={url + i} className="mb-4 break-inside-avoid overflow-hidden rounded-[var(--radius-md)]">
              <MediaImage imageUrl={url} alt={`Gallery ${i + 1}`} className="w-full object-cover" />
            </div>
          ))}
        </div>
      );
    }
    default:
      return null;
  }
}

export function EditorialGallery({ project }: { project: BrandingProject }) {
  const items = sortByOrder(project.gallery);
  if (!items.length) return null;
  return (
    <section className="mt-16 md:mt-24">
      <Reveal>
        <h2 className="font-display mb-8 text-3xl">Galeria</h2>
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="mb-4 break-inside-avoid overflow-hidden rounded-[var(--radius-lg)]"
            >
              <MediaImage
                mediaId={item.mediaId}
                alt="Gallery"
                className="w-full object-cover transition duration-500 hover:scale-[1.02]"
              />
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
