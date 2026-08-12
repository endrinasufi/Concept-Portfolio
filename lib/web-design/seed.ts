import type { WebDesignProject } from "@/types/web-design";
import {
  defaultFeaturedVisual,
  defaultWebDesignAppearance,
} from "@/types/web-design";
import { createId, nowIso } from "@/lib/utils/id";

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;

export function createSeedWebDesignProjects(): WebDesignProject[] {
  const stamp = nowIso();

  return [
    {
      id: createId(),
      service: "web-design",
      slug: "lumen-atelier",
      title: "Lumen Atelier",
      serviceLabel: "Web Design",
      client: "Lumen Atelier",
      industry: "Architecture",
      year: "2025",
      services: ["UX/UI", "Web Design", "Development"],
      descriptionTitle: "Description",
      description:
        "Full UX/UI redesign of a contemporary architecture studio website — a cinematic digital presence that presents projects as editorial compositions, with a precise desktop experience and a refined mobile counterpart.",
      websiteUrl: "https://conceptmarketing.al",
      status: "published",
      order: 0,
      featured: true,
      appearance: defaultWebDesignAppearance(),
      featuredVisual: {
        ...defaultFeaturedVisual(),
        backgroundImageUrl: u("photo-1486406146926-c627a92ad1ab", 1800),
        backgroundPosition: "50% 40%",
        backgroundOverlayColor: "#000000",
        backgroundOverlay: 0.48,
        backgroundBlur: 18,
        desktopImageUrl: u("photo-1460925895917-afdab827c52f", 1600),
        mobileImageUrl: u("photo-1512941937669-90a1b58e7e9c", 800),
      },
      gallery: [
        {
          id: createId(),
          imageUrl: u("photo-1460925895917-afdab827c52f", 1400),
          alt: "Homepage desktop",
          order: 0,
          displayType: "desktop",
        },
        {
          id: createId(),
          imageUrl: u("photo-1512941937669-90a1b58e7e9c", 800),
          alt: "Mobile project view",
          order: 1,
          displayType: "mobile",
        },
        {
          id: createId(),
          imageUrl: u("photo-1545235617-9465d2a55698", 1200),
          alt: "Project grid",
          order: 2,
          displayType: "desktop",
        },
        {
          id: createId(),
          imageUrl: u("photo-1558655146-d09347e92766", 1400),
          alt: "Case study page",
          order: 3,
          displayType: "desktop",
        },
        {
          id: createId(),
          imageUrl: u("photo-1522542550221-31fd19575a2d", 900),
          alt: "Contact mobile",
          order: 4,
          displayType: "mobile",
        },
        {
          id: createId(),
          imageUrl: u("photo-1498050108023-c4244f25dfcf", 1200),
          alt: "Studio page",
          order: 5,
          displayType: "desktop",
        },
      ],
      seo: {
        metaTitle: "Lumen Atelier — Web Design",
        metaDescription:
          "Case study Web Design për Lumen Atelier nga Concept Marketing Albania.",
      },
      createdAt: stamp,
      updatedAt: stamp,
    },
  ];
}
