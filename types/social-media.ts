export type SocialMediaProjectStatus = "draft" | "published";

export interface SocialMediaUsername {
  id: string;
  label: string;
  url: string;
  order: number;
}

export interface SocialMediaFeedPost {
  id: string;
  mediaId?: string;
  imageUrl?: string;
  alt: string;
  caption?: string;
  order: number;
  objectPosition?: string;
}

export interface SocialMediaReel {
  id: string;
  thumbnailMediaId?: string;
  thumbnailUrl?: string;
  videoMediaId?: string;
  videoUrl?: string;
  title?: string;
  order: number;
}

export interface SocialMediaStory {
  id: string;
  mediaId?: string;
  imageUrl?: string;
  alt: string;
  title?: string;
  order: number;
}

export interface SocialMediaSeo {
  metaTitle?: string;
  metaDescription?: string;
}

export interface SocialMediaPageAppearance {
  /** Page background — default #EAEAEA */
  backgroundColor: string;
  /** Decorative line stroke color */
  lineColor: string;
}

export interface SocialMediaBlock1 {
  mockupImage1MediaId?: string;
  mockupImage1Url?: string;
  mockupImage2MediaId?: string;
  mockupImage2Url?: string;
  feedPosts: SocialMediaFeedPost[];
}

export interface SocialMediaBlock2 {
  title: string;
  audience: string;
  projectChallenge: string;
  result: string;
  backgroundColors: string[];
  grainStrength: number;
  reels: SocialMediaReel[];
}

export interface SocialMediaBlock3 {
  stories: SocialMediaStory[];
}

export interface SocialMediaProject {
  id: string;
  service: "social-media";
  slug: string;
  title: string;
  clientName: string;
  serviceLabel: string;
  usernames: SocialMediaUsername[];
  status: SocialMediaProjectStatus;
  order: number;
  /** Cover për listën /social-media */
  coverMediaId?: string;
  coverImageUrl?: string;
  pageAppearance: SocialMediaPageAppearance;
  block1: SocialMediaBlock1;
  block2: SocialMediaBlock2;
  block3: SocialMediaBlock3;
  seo: SocialMediaSeo;
  createdAt: string;
  updatedAt: string;
}

export function defaultPageAppearance(): SocialMediaPageAppearance {
  return {
    backgroundColor: "#EAEAEA",
    lineColor: "#1a1a1a",
  };
}

/** Cover i rekomanduar për kartën në /social-media (portrait). */
export const SOCIAL_MEDIA_COVER_FRAME = {
  width: 1080,
  height: 1350,
  ratioLabel: "4:5",
} as const;

export function defaultBlock2(): SocialMediaBlock2 {
  return {
    title: "",
    audience: "",
    projectChallenge: "",
    result: "",
    backgroundColors: ["#141018", "#2a1820", "#0a0c12"],
    grainStrength: 0.55,
    reels: [],
  };
}

export function emptySocialMediaProjectDraft(): Omit<
  SocialMediaProject,
  "id" | "createdAt" | "updatedAt"
> {
  return {
    service: "social-media",
    slug: "",
    title: "",
    clientName: "",
    serviceLabel: "Social Media Management",
    usernames: [],
    status: "draft",
    order: 0,
    coverMediaId: undefined,
    coverImageUrl: undefined,
    pageAppearance: defaultPageAppearance(),
    block1: { feedPosts: [] },
    block2: defaultBlock2(),
    block3: { stories: [] },
    seo: {},
  };
}
