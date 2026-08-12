/**
 * Kategoritë e portfolio — sa herë shtohet një entry këtu
 * (dhe ruta përkatëse), butoni shfaqet automatikisht në homepage grid.
 */
export const SITE_CATEGORIES = [
  { id: "branding", label: "Branding", href: "/branding" },
] as const;

export type SiteCategory = (typeof SITE_CATEGORIES)[number];
