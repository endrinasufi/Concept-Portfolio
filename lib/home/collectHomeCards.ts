import type { BrandingProject } from "@/types/branding";
import type { SocialMediaProject } from "@/types/social-media";
import type { VideoProductionItem } from "@/types/video-production";
import type { WebDesignProject } from "@/types/web-design";
import type { ClientLogo } from "@/types/settings";
import type { SiteCategory } from "@/lib/data/categories";
import { getProjectCover } from "@/lib/utils/projectCover";
import { collectProjectPhotos } from "@/lib/utils/projectPhotos";
import { homeCardCount } from "@/lib/home/scrollCardLayout";
import { youtubeThumbnailUrl } from "@/lib/video-production/youtube";

export type HomeCard = {
  id: string;
  kind: "service" | "project";
  title?: string;
  client?: string;
  tagColors?: string[];
  ctaLabel?: string;
  mediaId?: string;
  imageUrl?: string;
  href?: string;
};

function padRepeat(items: HomeCard[], count: number): HomeCard[] {
  if (count <= 0 || !items.length) return [];
  const out: HomeCard[] = [];
  for (let i = 0; i < count; i++) {
    const src = items[i % items.length];
    out.push(i < items.length ? src : { ...src, id: `${src.id}__r${i}` });
  }
  return out;
}

function socialProjectThumbnail(project: SocialMediaProject): {
  mediaId?: string;
  imageUrl?: string;
} {
  const feed = [...(project.block1.feedPosts ?? [])].sort(
    (a, b) => a.order - b.order,
  )[0];
  const reel = [...(project.block2.reels ?? [])].sort(
    (a, b) => a.order - b.order,
  )[0];
  const story = [...(project.block3.stories ?? [])].sort(
    (a, b) => a.order - b.order,
  )[0];

  return {
    mediaId:
      feed?.mediaId ??
      project.block1.mockupImage1MediaId ??
      project.block1.mockupImage2MediaId ??
      reel?.thumbnailMediaId ??
      story?.mediaId,
    imageUrl:
      feed?.imageUrl ??
      project.block1.mockupImage1Url ??
      project.block1.mockupImage2Url ??
      reel?.thumbnailUrl ??
      story?.imageUrl,
  };
}

function brandingProjectCards(projects: BrandingProject[]): HomeCard[] {
  const cards: HomeCard[] = [];

  const sorted = [...projects].sort((a, b) => {
    if (a.featured !== b.featured) return Number(b.featured) - Number(a.featured);
    return a.order - b.order;
  });

  for (const project of sorted) {
    const { coverUrl, coverMediaId } = getProjectCover(project);
    const photos = collectProjectPhotos(project);
    const mediaId = coverMediaId ?? photos[0]?.mediaId;
    const imageUrl = coverUrl ?? photos[0]?.imageUrl;
    if (!mediaId && !imageUrl) continue;

    cards.push({
      id: `cover-${project.id}`,
      kind: "project",
      title: project.title,
      client: project.client?.trim() || undefined,
      tagColors: (project.brandColors ?? [])
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((c) => c.hex)
        .filter(Boolean),
      mediaId,
      imageUrl,
      href: `/branding/${project.slug}`,
    });
  }

  return cards;
}

function socialProjectCards(projects: SocialMediaProject[]): HomeCard[] {
  const cards: HomeCard[] = [];

  const sorted = [...projects].sort((a, b) => a.order - b.order);

  for (const project of sorted) {
    const thumb = socialProjectThumbnail(project);
    if (!thumb.mediaId && !thumb.imageUrl) continue;

    cards.push({
      id: `sm-cover-${project.id}`,
      kind: "project",
      title: project.title,
      client: project.clientName?.trim() || undefined,
      tagColors: [
        ...(project.block2.backgroundColors ?? []),
        project.pageAppearance?.lineColor,
      ].filter((c): c is string => Boolean(c?.trim())),
      mediaId: thumb.mediaId,
      imageUrl: thumb.imageUrl,
      href: `/social-media/${project.slug}`,
    });
  }

  return cards;
}

function videoProductionCards(videos: VideoProductionItem[]): HomeCard[] {
  const sorted = [...videos].sort((a, b) => a.order - b.order);
  return sorted.map((video) => ({
    id: `vp-${video.id}`,
    kind: "project" as const,
    title: video.title,
    client: video.clientName?.trim() || undefined,
    tagColors: [video.accentColor].filter(Boolean),
    imageUrl: youtubeThumbnailUrl(video.youtubeId),
    href: "/video-production",
  }));
}

function webDesignProjectCards(projects: WebDesignProject[]): HomeCard[] {
  const sorted = [...projects].sort((a, b) => {
    if (a.featured !== b.featured) return Number(b.featured) - Number(a.featured);
    return a.order - b.order;
  });

  const cards: HomeCard[] = [];
  for (const project of sorted) {
    const fv = project.featuredVisual;
    const galleryFirst = [...(project.gallery ?? [])].sort(
      (a, b) => a.order - b.order,
    )[0];
    const mediaId =
      project.coverMediaId ??
      fv?.desktopMediaId ??
      fv?.backgroundMediaId ??
      fv?.mobileMediaId ??
      galleryFirst?.mediaId;
    const imageUrl =
      project.coverImageUrl ??
      fv?.desktopImageUrl ??
      fv?.backgroundImageUrl ??
      fv?.mobileImageUrl ??
      galleryFirst?.imageUrl;
    if (!mediaId && !imageUrl) continue;

    cards.push({
      id: `wd-cover-${project.id}`,
      kind: "project",
      title: project.title,
      client: project.client?.trim() || undefined,
      tagColors: [project.appearance?.accentColor].filter(
        (c): c is string => Boolean(c?.trim()),
      ),
      mediaId,
      imageUrl,
      href: `/web-design/${project.slug}`,
    });
  }
  return cards;
}

export function collectCategoryCards(opts: {
  category: SiteCategory;
  brandingProjects: BrandingProject[];
  socialProjects: SocialMediaProject[];
  videoItems?: VideoProductionItem[];
  webDesignProjects?: WebDesignProject[];
  clientLogos: ClientLogo[];
  viewportWidth: number;
}): HomeCard[] {
  const max = homeCardCount(opts.viewportWidth);
  const serviceCard: HomeCard = {
    id: `service-${opts.category.id}`,
    kind: "service",
    title: opts.category.label,
    ctaLabel: "Shiko të gjitha",
    href: opts.category.href,
  };

  const videos = opts.videoItems ?? [];
  const webProjects = opts.webDesignProjects ?? [];
  let pool: HomeCard[] = [];
  if (opts.category.id === "branding") {
    pool = brandingProjectCards(opts.brandingProjects);
  } else if (opts.category.id === "social-media") {
    pool = socialProjectCards(opts.socialProjects);
  } else if (opts.category.id === "web-design") {
    pool = webDesignProjectCards(webProjects);
  } else if (opts.category.id === "video-production") {
    pool = videoProductionCards(videos);
  }

  // Fallback vetëm brenda kategoriës — mos përdor video te Web Design
  if (!pool.length) {
    if (opts.category.id === "web-design") {
      pool = [];
    } else if (opts.category.id === "social-media") {
      pool = socialProjectCards(opts.socialProjects);
    } else {
      pool = brandingProjectCards(opts.brandingProjects);
    }
  }

  const rest = padRepeat(pool, Math.max(0, max - 1)).map((card) => ({
    ...card,
    id: `${opts.category.id}-${card.id}`,
  }));
  return [serviceCard, ...rest].slice(0, max);
}

/** @deprecated — përdor collectCategoryCards */
export function collectHomeCards(
  projects: BrandingProject[],
  clientLogos: ClientLogo[],
  viewportWidth: number,
): HomeCard[] {
  return collectCategoryCards({
    category: { id: "branding", label: "Branding", href: "/branding" },
    brandingProjects: projects,
    socialProjects: [],
    videoItems: [],
    webDesignProjects: [],
    clientLogos,
    viewportWidth,
  });
}
