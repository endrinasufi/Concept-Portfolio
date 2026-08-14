import type { BrandingProject } from "@/types/branding";
import type { SocialMediaProject } from "@/types/social-media";
import type { VideoProductionItem } from "@/types/video-production";
import type { WebDesignProject } from "@/types/web-design";
import type { PhotoshootingProject } from "@/types/photoshooting";
import type { ClientLogo, HomeFeatured, HomeFeaturedItem } from "@/types/settings";
import type { SiteCategory } from "@/lib/data/categories";
import { getProjectCover } from "@/lib/utils/projectCover";
import { collectProjectPhotos } from "@/lib/utils/projectPhotos";
import { homeCardCount } from "@/lib/home/scrollCardLayout";
import { youtubeThumbnailUrl } from "@/lib/video-production/youtube";
import { pickFeatured, homeFeaturedLimit } from "@/lib/home/pickFeatured";

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

function withThumb(
  card: HomeCard,
  thumbnailMediaId?: string,
): HomeCard {
  if (!thumbnailMediaId) return card;
  return { ...card, mediaId: thumbnailMediaId, imageUrl: undefined };
}

function brandingProjectCards(
  projects: BrandingProject[],
  picks?: HomeFeaturedItem[],
): HomeCard[] {
  const cards: HomeCard[] = [];
  const chosen = pickFeatured(
    [...projects].sort((a, b) => {
      if (a.featured !== b.featured) return Number(b.featured) - Number(a.featured);
      return a.order - b.order;
    }),
    picks,
  );

  for (const { project, thumbnailMediaId } of chosen) {
    const { coverUrl, coverMediaId } = getProjectCover(project);
    const photos = collectProjectPhotos(project);
    const mediaId = thumbnailMediaId ?? coverMediaId ?? photos[0]?.mediaId;
    const imageUrl = thumbnailMediaId ? undefined : (coverUrl ?? photos[0]?.imageUrl);
    if (!mediaId && !imageUrl) continue;

    cards.push(
      withThumb(
        {
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
        },
        thumbnailMediaId,
      ),
    );
  }

  return cards;
}

function socialProjectCards(
  projects: SocialMediaProject[],
  picks?: HomeFeaturedItem[],
): HomeCard[] {
  const cards: HomeCard[] = [];
  const chosen = pickFeatured(
    [...projects].sort((a, b) => a.order - b.order),
    picks,
  );

  for (const { project, thumbnailMediaId } of chosen) {
    const thumb = socialProjectThumbnail(project);
    const mediaId = thumbnailMediaId ?? thumb.mediaId;
    const imageUrl = thumbnailMediaId ? undefined : thumb.imageUrl;
    if (!mediaId && !imageUrl) continue;

    cards.push({
      id: `sm-cover-${project.id}`,
      kind: "project",
      title: project.title,
      client: project.clientName?.trim() || undefined,
      tagColors: [
        ...(project.block2.backgroundColors ?? []),
        project.pageAppearance?.lineColor,
      ].filter((c): c is string => Boolean(c?.trim())),
      mediaId,
      imageUrl,
      href: `/social-media/${project.slug}`,
    });
  }

  return cards;
}

function videoProductionCards(
  videos: VideoProductionItem[],
  picks?: HomeFeaturedItem[],
): HomeCard[] {
  const chosen = pickFeatured(
    [...videos].sort((a, b) => a.order - b.order),
    picks,
  );
  return chosen.map(({ project: video, thumbnailMediaId }) => ({
    id: `vp-${video.id}`,
    kind: "project" as const,
    title: video.title,
    client: video.clientName?.trim() || undefined,
    tagColors: [video.accentColor].filter(Boolean),
    mediaId: thumbnailMediaId,
    imageUrl: thumbnailMediaId ? undefined : youtubeThumbnailUrl(video.youtubeId),
    href: "/video-production",
  }));
}

function webDesignProjectCards(
  projects: WebDesignProject[],
  picks?: HomeFeaturedItem[],
): HomeCard[] {
  const chosen = pickFeatured(
    [...projects].sort((a, b) => {
      if (a.featured !== b.featured) return Number(b.featured) - Number(a.featured);
      return a.order - b.order;
    }),
    picks,
  );

  const cards: HomeCard[] = [];
  for (const { project, thumbnailMediaId } of chosen) {
    const fv = project.featuredVisual;
    const galleryFirst = [...(project.gallery ?? [])].sort(
      (a, b) => a.order - b.order,
    )[0];
    const mediaId =
      thumbnailMediaId ??
      project.coverMediaId ??
      fv?.desktopMediaId ??
      fv?.backgroundMediaId ??
      fv?.mobileMediaId ??
      galleryFirst?.mediaId;
    const imageUrl = thumbnailMediaId
      ? undefined
      : project.coverImageUrl ??
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

function photoshootingProjectCards(
  projects: PhotoshootingProject[],
  picks?: HomeFeaturedItem[],
): HomeCard[] {
  const chosen = pickFeatured(
    [...projects].sort((a, b) => {
      if (a.featured !== b.featured) return Number(b.featured) - Number(a.featured);
      return a.order - b.order;
    }),
    picks,
  );
  const cards: HomeCard[] = [];
  for (const { project, thumbnailMediaId } of chosen) {
    const first = [...(project.cells ?? [])].sort((a, b) => a.order - b.order)[0];
    const mediaId = thumbnailMediaId ?? project.coverMediaId ?? first?.mediaId;
    const imageUrl = thumbnailMediaId
      ? undefined
      : project.coverImageUrl || first?.imageUrl;
    if (!mediaId && !imageUrl) continue;
    cards.push({
      id: `ph-cover-${project.id}`,
      kind: "project",
      title: project.title,
      client: project.clientName?.trim() || undefined,
      mediaId,
      imageUrl,
      href: `/photoshooting/${project.slug}`,
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
  photoshootingProjects?: PhotoshootingProject[];
  clientLogos: ClientLogo[];
  viewportWidth: number;
  homeFeatured?: HomeFeatured;
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
  const photoProjects = opts.photoshootingProjects ?? [];
  const picks = (opts.homeFeatured?.[opts.category.id] ?? []).slice(
    0,
    homeFeaturedLimit(opts.category.id),
  );
  const featuredPicks = picks.length ? picks : undefined;
  let pool: HomeCard[] = [];
  if (opts.category.id === "branding") {
    pool = brandingProjectCards(opts.brandingProjects, featuredPicks);
  } else if (opts.category.id === "social-media") {
    pool = socialProjectCards(opts.socialProjects, featuredPicks);
  } else if (opts.category.id === "web-design") {
    pool = webDesignProjectCards(webProjects, featuredPicks);
  } else if (opts.category.id === "video-production") {
    pool = videoProductionCards(videos, featuredPicks);
  } else if (opts.category.id === "photoshooting") {
    pool = photoshootingProjectCards(photoProjects, featuredPicks);
  }

  // Fallback vetëm kur nuk ka zgjedhje manuale
  if (!pool.length && !picks?.length) {
    if (opts.category.id === "web-design") {
      pool = [];
    } else if (opts.category.id === "social-media") {
      pool = socialProjectCards(opts.socialProjects);
    } else if (opts.category.id === "photoshooting") {
      pool = photoshootingProjectCards(photoProjects);
    } else if (opts.category.id === "video-production") {
      pool = videoProductionCards(videos);
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
