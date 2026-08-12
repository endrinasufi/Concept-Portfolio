export type WebDesignProjectStatus = "draft" | "published";

export type WebDesignGalleryDisplayType = "desktop" | "mobile";

export interface WebDesignSeo {
  metaTitle?: string;
  metaDescription?: string;
}

export interface WebDesignAppearance {
  pageBackgroundColor: string;
  textColor: string;
  accentColor: string;
}

export interface WebDesignFeaturedVisual {
  backgroundMediaId?: string;
  backgroundImageUrl?: string;
  backgroundPosition?: string;
  backgroundOverlayColor?: string;
  backgroundOverlay?: number;
  backgroundBlur?: number;
  desktopMediaId?: string;
  desktopImageUrl?: string;
  desktopScale: number;
  desktopPositionX: number;
  desktopPositionY: number;
  mobileMediaId?: string;
  mobileImageUrl?: string;
  mobileScale: number;
  mobilePositionX: number;
  mobilePositionY: number;
}

export interface WebDesignGalleryItem {
  id: string;
  mediaId?: string;
  imageUrl?: string;
  alt: string;
  order: number;
  displayType: WebDesignGalleryDisplayType;
  objectPosition?: string;
}

export interface WebDesignProject {
  id: string;
  service: "web-design";
  slug: string;
  title: string;
  serviceLabel: string;
  projectNumber?: number;
  client?: string;
  industry?: string;
  year?: string;
  services: string[];
  descriptionTitle: string;
  description: string;
  websiteUrl?: string;
  status: WebDesignProjectStatus;
  order: number;
  featured: boolean;
  /** Cover për listën /web-design */
  coverMediaId?: string;
  coverImageUrl?: string;
  appearance: WebDesignAppearance;
  featuredVisual: WebDesignFeaturedVisual;
  gallery: WebDesignGalleryItem[];
  seo: WebDesignSeo;
  createdAt: string;
  updatedAt: string;
}

/** Featured visual: blloku 16:9.5 (më i ulët që të hyjë pa scroll). */
export const WEB_DESIGN_FEATURED_FRAMES = {
  background: {
    width: 1920,
    height: 1140,
    ratioLabel: "16:9.5",
    aspect: "16 / 9.5",
    previewClass: "aspect-[16/9.5]",
  },
  desktop: {
    width: 1131,
    height: 1311,
    ratioLabel: "377:437",
    aspect: "377 / 437",
    previewClass: "aspect-[377/437]",
  },
  mobile: {
    width: 381,
    height: 1170,
    ratioLabel: "127:390",
    aspect: "127 / 390",
    previewClass: "aspect-[127/390]",
  },
} as const;

/** Lartësia e mobile ndaj desktop (të dyja mbarojnë në fund të bllokut). */
export const WEB_DESIGN_MOBILE_HEIGHT_REL =
  WEB_DESIGN_FEATURED_FRAMES.mobile.height /
  WEB_DESIGN_FEATURED_FRAMES.desktop.height;

/** Screenshot-e carousel: desktop pak më i ngushtë, mobile pak më i gjerë. */
export const WEB_DESIGN_GALLERY_FRAMES = {
  desktop: {
    width: 1920,
    height: 1280,
    ratioLabel: "3:2",
    aspect: "3 / 2",
    aspectClass: "aspect-[3/2]",
  },
  mobile: {
    width: 1170,
    height: 2080,
    ratioLabel: "9:16",
    aspect: "9 / 16",
    aspectClass: "aspect-[9/16]",
  },
} as const;

/** Cover i rekomanduar për kartën në /web-design */
export const WEB_DESIGN_COVER_FRAME = {
  width: 1920,
  height: 1080,
  ratioLabel: "16:9",
} as const;

export function defaultWebDesignAppearance(): WebDesignAppearance {
  return {
    pageBackgroundColor: "#000000",
    textColor: "#FFFFFF",
    accentColor: "#D4D4D4",
  };
}

export function defaultFeaturedVisual(): WebDesignFeaturedVisual {
  return {
    backgroundPosition: "50% 50%",
    backgroundOverlayColor: "#000000",
    backgroundOverlay: 0.42,
    backgroundBlur: 18,
    desktopScale: 1,
    desktopPositionX: 0,
    desktopPositionY: 0,
    mobileScale: 1,
    mobilePositionX: 0,
    mobilePositionY: 0,
  };
}

export function emptyWebDesignProjectDraft(): Omit<
  WebDesignProject,
  "id" | "createdAt" | "updatedAt"
> {
  return {
    service: "web-design",
    slug: "",
    title: "",
    serviceLabel: "Web Design",
    services: [],
    descriptionTitle: "Description",
    description: "",
    status: "draft",
    order: 0,
    featured: false,
    coverMediaId: undefined,
    coverImageUrl: undefined,
    appearance: defaultWebDesignAppearance(),
    featuredVisual: defaultFeaturedVisual(),
    gallery: [],
    seo: {},
  };
}
