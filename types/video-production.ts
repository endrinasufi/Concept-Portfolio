export type VideoProductionStatus = "draft" | "published";

/** landscape = 16:9, portrait = reel / Shorts 9:16 */
export type VideoOrientation = "landscape" | "portrait";

export interface VideoProductionItem {
  id: string;
  title: string;
  clientName: string;
  /** YouTube video ID (11 chars) */
  youtubeId: string;
  description?: string;
  orientation: VideoOrientation;
  /** Ngjyrë aksenti për UI (tag / border) */
  accentColor: string;
  status: VideoProductionStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export function emptyVideoProductionDraft(): Omit<
  VideoProductionItem,
  "id" | "createdAt" | "updatedAt"
> {
  return {
    title: "",
    clientName: "",
    youtubeId: "",
    description: "",
    orientation: "portrait",
    accentColor: "#f19a2a",
    status: "draft",
    order: 0,
  };
}

export function normalizeVideoOrientation(
  value: unknown,
): VideoOrientation {
  return value === "portrait" ? "portrait" : "landscape";
}
