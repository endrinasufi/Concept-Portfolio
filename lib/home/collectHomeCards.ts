import type { BrandingProject } from "@/types/branding";
import type { ClientLogo } from "@/types/settings";
import { getProjectCover } from "@/lib/utils/projectCover";
import { collectProjectPhotos } from "@/lib/utils/projectPhotos";
import { homeCardCount } from "@/lib/home/scrollCardLayout";

export type HomeCard = {
  id: string;
  mediaId?: string;
  imageUrl?: string;
  href?: string;
};

function targetCount(viewportWidth: number): number {
  return homeCardCount(viewportWidth);
}

export function collectHomeCards(
  projects: BrandingProject[],
  clientLogos: ClientLogo[],
  viewportWidth: number,
): HomeCard[] {
  const max = targetCount(viewportWidth);
  const cards: HomeCard[] = [];
  const seen = new Set<string>();

  function push(card: HomeCard) {
    if (cards.length >= max) return;
    const key = card.mediaId ? `id:${card.mediaId}` : `url:${card.imageUrl}`;
    if (seen.has(key)) return;
    seen.add(key);
    cards.push(card);
  }

  const sorted = [...projects].sort((a, b) => {
    if (a.featured !== b.featured) return Number(b.featured) - Number(a.featured);
    return a.order - b.order;
  });

  for (const project of sorted) {
    const { coverUrl, coverMediaId } = getProjectCover(project);
    push({
      id: `cover-${project.id}`,
      mediaId: coverMediaId,
      imageUrl: coverUrl,
      href: `/branding/${project.slug}`,
    });

    for (const photo of collectProjectPhotos(project)) {
      if (cards.length >= max) break;
      push({
        id: `photo-${project.id}-${photo.mediaId ?? photo.imageUrl}`,
        mediaId: photo.mediaId,
        imageUrl: photo.imageUrl,
        href: `/branding/${project.slug}`,
      });
    }
  }

  for (const logo of clientLogos) {
    if (cards.length >= max) break;
    push({
      id: `logo-${logo.id}`,
      mediaId: logo.mediaId,
    });
  }

  return cards.slice(0, max);
}
