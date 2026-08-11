import type { BrandingProject, BrandingSection, BrandColor, TypographyItem } from "@/types/branding";
import { createId, nowIso } from "@/lib/utils/id";

function color(hex: string, order: number): BrandColor {
  return { id: createId(), hex, order };
}

function typo(
  role: TypographyItem["role"],
  fontName: string,
  fontWeight: string,
  sampleText: string,
): TypographyItem {
  return { id: createId(), role, fontName, fontWeight, sampleText };
}

function section(
  type: BrandingSection["type"],
  order: number,
  content: Record<string, unknown> = {},
  settings: Record<string, unknown> = {},
): BrandingSection {
  return { id: createId(), type, order, content, settings };
}

/** External placeholder images used only for seed projects (resolved at render via URL in content). */
export const SEED_IMAGE = {
  nordic1: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&q=80",
  nordic2: "https://images.unsplash.com/photo-1634017839464-5c339bbe3c47?w=1200&q=80",
  nordic3: "https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=1200&q=80",
  nordicLogo: "https://images.unsplash.com/photo-1611162617474-5b21e11e480f?w=800&q=80",
  citrus1: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80",
  citrus2: "https://images.unsplash.com/photo-1614850715649-1d0106293bd1?w=1200&q=80",
  citrus3: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80",
  citrus4: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80",
  citrusLogo: "https://images.unsplash.com/photo-1626785774573-4b7993143486?w=800&q=80",
  atelier1: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1600&q=80",
  atelier2: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1200&q=80",
  atelier3: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1200&q=80",
  atelier4: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=1200&q=80",
  atelier5: "https://images.unsplash.com/photo-1614850523459-c2f4ebe36b84?w=1200&q=80",
  atelierLogo: "https://images.unsplash.com/photo-1634942537034-2531766767d1?w=800&q=80",
} as const;

function baseProject(
  partial: Omit<BrandingProject, "id" | "createdAt" | "updatedAt" | "service"> & {
    id?: string;
  },
): BrandingProject {
  const stamp = nowIso();
  return {
    id: partial.id ?? createId(),
    service: "branding",
    createdAt: stamp,
    updatedAt: stamp,
    ...partial,
  };
}

export function createSeedProjects(): BrandingProject[] {
  return [
    // 2 colors — minimal dual palette
    baseProject({
      id: "seed-nordic-brew",
      slug: "nordic-brew",
      title: "Nordic Brew",
      shortDescription: "Identitet minimal për një markë specialty coffee me dy ngjyra dhe tipografi të pastër.",
      client: "Nordic Brew Co.",
      industry: "F&B / Coffee",
      year: 2025,
      services: ["Brand Strategy", "Logo", "Packaging"],
      primaryBackgroundColor: "#0f1412",
      brandColors: [color("#C4A574", 0), color("#1A2E28", 1)],
      typography: [
        typo("primary", "Fraunces", "600", "Nordic Brew"),
        typo("secondary", "Outfit", "400", "Specialty coffee, slow mornings."),
      ],
      status: "published",
      featured: true,
      order: 0,
      metaTitle: "Nordic Brew — Branding | CMA",
      metaDescription: "Identitet vizual minimal për Nordic Brew.",
      sections: [
        section("text", 0, {
          heading: "Qetësi nordike",
          body: "Dy ngjyra, një ritëm. Identiteti përqendrohet në hapësirë negative dhe materialitet të ngrohtë.",
        }),
        section("image", 1, { imageUrl: SEED_IMAGE.nordic2, caption: "Mood board" }),
        section("imageGrid2", 2, {
          imageUrlA: SEED_IMAGE.nordic1,
          imageUrlB: SEED_IMAGE.nordic3,
        }),
        section("typography", 3, {}),
        section("colorPalette", 4, {}),
        section("fullWidthImage", 5, { imageUrl: SEED_IMAGE.nordic1 }),
      ],
      gallery: [],
      logoMediaId: undefined,
    }),

    // 4 colors
    baseProject({
      id: "seed-citrus-studio",
      slug: "citrus-studio",
      title: "Citrus Studio",
      shortDescription: "Sistem vizual energjik me katër ngjyra për një studio kreative digjitale.",
      client: "Citrus Studio",
      industry: "Creative Agency",
      year: 2024,
      services: ["Visual Identity", "Guidelines", "Stationery"],
      primaryBackgroundColor: "#121018",
      brandColors: [
        color("#FF6B35", 0),
        color("#F7C948", 1),
        color("#2EC4B6", 2),
        color("#1B1B2F", 3),
      ],
      typography: [
        typo("primary", "Syne", "700", "Citrus"),
        typo("secondary", "Outfit", "500", "Design that zings."),
        typo("custom", "JetBrains Mono", "400", "AA / 01"),
      ],
      status: "published",
      featured: true,
      order: 1,
      metaTitle: "Citrus Studio — Branding | CMA",
      metaDescription: "Identitet energjik me katër ngjyra për Citrus Studio.",
      sections: [
        section("text", 0, {
          heading: "Energji e matur",
          body: "Katër ngjyra që flasin me ritëm — portokalli si impuls, verdha si dritë, teal si ekuilibër.",
        }),
        section("brandApplication", 1, {
          imageUrl: SEED_IMAGE.citrus2,
          caption: "Aplikim në media",
        }),
        section("imageGrid3", 2, {
          imageUrlA: SEED_IMAGE.citrus1,
          imageUrlB: SEED_IMAGE.citrus3,
          imageUrlC: SEED_IMAGE.citrus4,
        }),
        section("mockup", 3, { imageUrl: SEED_IMAGE.citrus2 }),
        section("typography", 4, {}),
        section("colorPalette", 5, {}),
        section("spacer", 6, {}, { height: 48 }),
      ],
      gallery: [],
    }),

    // 5 colors — draft to demonstrate gating
    baseProject({
      id: "seed-atelier-luce",
      slug: "atelier-luce",
      title: "Atelier Luce",
      shortDescription: "Paletë e pasur me pesë ngjyra për një atelier mode luksoze (draft).",
      client: "Atelier Luce",
      industry: "Fashion / Luxury",
      year: 2026,
      services: ["Rebrand", "Art Direction", "Lookbook"],
      primaryBackgroundColor: "#0c0b0a",
      brandColors: [
        color("#E8D5C4", 0),
        color("#8B3A3A", 1),
        color("#2C3E50", 2),
        color("#C9A227", 3),
        color("#1A1A1A", 4),
      ],
      typography: [
        typo("primary", "Cormorant Garamond", "600", "Atelier Luce"),
        typo("secondary", "Outfit", "300", "Light as craft."),
      ],
      status: "draft",
      featured: false,
      order: 2,
      metaTitle: "Atelier Luce — Branding | CMA",
      metaDescription: "Rebrand luksoz me pesë ngjyra për Atelier Luce.",
      sections: [
        section("text", 0, {
          heading: "Dritë e kontrolluar",
          body: "Pesë nuanca që ndërtojnë një botë luksoze — krem, bordeaux, indigo i thellë, ari dhe e zeza.",
        }),
        section("image", 1, { imageUrl: SEED_IMAGE.atelier2 }),
        section("imageGrid2", 2, {
          imageUrlA: SEED_IMAGE.atelier3,
          imageUrlB: SEED_IMAGE.atelier4,
        }),
        section("fullWidthImage", 3, { imageUrl: SEED_IMAGE.atelier1 }),
        section("typography", 4, {}),
        section("colorPalette", 5, {}),
        section("video", 6, {
          url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          caption: "Motion teaser (placeholder)",
        }),
      ],
      gallery: [],
    }),
  ];
}

/** Cover / logo URLs for seed projects keyed by slug (used when no mediaId). */
export const SEED_COVERS: Record<string, { cover: string; logo: string }> = {
  "nordic-brew": { cover: SEED_IMAGE.nordic1, logo: SEED_IMAGE.nordicLogo },
  "citrus-studio": { cover: SEED_IMAGE.citrus1, logo: SEED_IMAGE.citrusLogo },
  "atelier-luce": { cover: SEED_IMAGE.atelier1, logo: SEED_IMAGE.atelierLogo },
};
