import type { HomeCardCategoryId } from "@/lib/data/categories";
import type { HomeFeaturedItem } from "@/types/settings";

/**
 * Sa projekte shfaqen me karta (pa kartën e kategorisë):
 * Branding: fan intro = 7 karta total → 6 projekte
 * Social / Web: 9 karta total → 8 projekte
 */
export const HOME_FEATURED_LIMITS: Record<HomeCardCategoryId, number> = {
  branding: 6,
  "social-media": 8,
  "web-design": 8,
};

export function homeFeaturedLimit(categoryId: string): number {
  if (categoryId in HOME_FEATURED_LIMITS) {
    return HOME_FEATURED_LIMITS[categoryId as HomeCardCategoryId];
  }
  return 8;
}

export function pickFeatured<T extends { id: string }>(
  items: T[],
  picks: HomeFeaturedItem[] | undefined,
  limit?: number,
): { project: T; thumbnailMediaId?: string }[] {
  if (!picks?.length) {
    return items.map((project) => ({ project }));
  }
  const cap = limit ?? picks.length;
  const map = new Map(items.map((item) => [item.id, item]));
  const out: { project: T; thumbnailMediaId?: string }[] = [];
  for (const pick of picks.slice(0, cap)) {
    const project = map.get(pick.projectId);
    if (project) {
      out.push({ project, thumbnailMediaId: pick.thumbnailMediaId });
    }
  }
  return out;
}
