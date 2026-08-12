"use client";

import Link from "next/link";
import { MediaImage } from "@/components/branding/MediaImage";
import { SITE_CATEGORIES } from "@/lib/data/categories";
import {
  HOME_GRID_COLS,
  HOME_GRID_ROWS,
  HOME_GRID_SLOTS,
  slotOpacity,
  type HomeGridSlot,
} from "@/lib/home/homeGridSlots";
import { useProjects } from "@/lib/hooks/useProjects";
import { useSiteSettings } from "@/lib/hooks/useSiteSettings";
import { getProjectCover } from "@/lib/utils/projectCover";
import { sortByOrder } from "@/lib/utils/id";
import type { BrandingProject } from "@/types/branding";
import type { ClientLogo } from "@/types/settings";

const TILE =
  "relative aspect-square overflow-hidden rounded-[1.1rem] md:rounded-[1.35rem]";

function PhotoTile({
  project,
  opacity,
}: {
  project: BrandingProject;
  opacity: number;
}) {
  const { coverUrl, coverMediaId } = getProjectCover(project);
  const interactive = opacity >= 0.15;

  return (
    <Link
      href={`/branding/${project.slug}`}
      className={`${TILE} bg-surface transition duration-500 hover:brightness-110`}
      style={{
        opacity,
        pointerEvents: interactive ? "auto" : "none",
      }}
      tabIndex={interactive ? 0 : -1}
      aria-hidden={!interactive}
    >
      <MediaImage
        mediaId={coverMediaId}
        imageUrl={coverUrl}
        alt={project.title}
        fit="cover"
        className="h-full w-full"
      />
    </Link>
  );
}

function LogoTile({ logo, opacity }: { logo: ClientLogo; opacity: number }) {
  return (
    <div
      className={`${TILE} flex items-center justify-center bg-[#141416] p-4 md:p-5`}
      style={{
        opacity,
        pointerEvents: "none",
      }}
      aria-hidden={opacity < 0.15}
    >
      <MediaImage
        mediaId={logo.mediaId}
        alt="Logo klienti"
        fit="contain"
        className="max-h-[58%] max-w-[70%] opacity-95"
      />
    </div>
  );
}

function CategoryTile({
  label,
  href,
  opacity,
}: {
  label: string;
  href: string;
  opacity: number;
}) {
  const interactive = opacity >= 0.15;

  return (
    <Link
      href={href}
      className={`${TILE} flex items-center justify-center border border-white/20 bg-transparent px-2 text-center transition duration-300 hover:border-white/45 hover:bg-white/[0.04]`}
      style={{
        opacity,
        pointerEvents: interactive ? "auto" : "none",
      }}
      tabIndex={interactive ? 0 : -1}
      aria-hidden={!interactive}
    >
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white md:text-xs">
        {label}
      </span>
    </Link>
  );
}

function renderSlot(
  slot: HomeGridSlot,
  photos: BrandingProject[],
  logos: ClientLogo[],
) {
  const opacity = slotOpacity(slot.row);
  const style = {
    gridColumn: slot.col,
    gridRow: slot.row,
  } as const;

  if (slot.kind === "photo") {
    const project = photos[slot.index];
    if (!project) return null;
    return (
      <div key={`photo-${slot.row}-${slot.col}`} style={style}>
        <PhotoTile project={project} opacity={opacity} />
      </div>
    );
  }

  if (slot.kind === "logo") {
    const logo = logos[slot.index];
    if (!logo) return null;
    return (
      <div key={`logo-${slot.row}-${slot.col}`} style={style}>
        <LogoTile logo={logo} opacity={opacity} />
      </div>
    );
  }

  const category = SITE_CATEGORIES[slot.index];
  if (!category) return null;

  return (
    <div key={`btn-${slot.row}-${slot.col}`} style={style}>
      <CategoryTile
        label={category.label}
        href={category.href}
        opacity={opacity}
      />
    </div>
  );
}

export function HomeSquareGrid() {
  const { projects, loading: projectsLoading } = useProjects({
    service: "branding",
  });
  const { settings, loading: settingsLoading } = useSiteSettings();

  const photos = [...projects].sort((a, b) => {
    if (a.featured !== b.featured) return Number(b.featured) - Number(a.featured);
    return a.order - b.order;
  });
  const logos = sortByOrder(settings.clientLogos ?? []);

  if (projectsLoading || settingsLoading) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center text-muted">
        Duke ngarkuar…
      </div>
    );
  }

  return (
    <div className="relative min-h-[100svh] w-full px-5 pb-10 pt-[var(--header-offset)] md:px-8 md:pb-14">
      <div
        className="mx-auto grid w-full max-w-7xl gap-3 sm:gap-4 md:gap-5 lg:gap-6"
        style={{
          gridTemplateColumns: `repeat(${HOME_GRID_COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${HOME_GRID_ROWS}, auto)`,
        }}
      >
        {HOME_GRID_SLOTS.map((slot) => renderSlot(slot, photos, logos))}
      </div>
    </div>
  );
}
