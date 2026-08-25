import type { SocialMediaNetwork, SocialMediaUsername } from "@/types/social-media";

export const SOCIAL_MEDIA_NETWORKS: {
  id: SocialMediaNetwork;
  label: string;
}[] = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "facebook", label: "Facebook" },
  { id: "youtube", label: "YouTube" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "x", label: "X" },
  { id: "pinterest", label: "Pinterest" },
  { id: "threads", label: "Threads" },
];

export function displayHandleLabel(label: string): string {
  return label.replace(/^@+/, "").trim();
}

export function networkFromUrl(url: string): SocialMediaNetwork | undefined {
  const raw = url.toLowerCase();
  if (raw.includes("instagram.com")) return "instagram";
  if (raw.includes("tiktok.com")) return "tiktok";
  if (raw.includes("facebook.com") || raw.includes("fb.com")) return "facebook";
  if (raw.includes("youtube.com") || raw.includes("youtu.be")) return "youtube";
  if (raw.includes("linkedin.com")) return "linkedin";
  if (raw.includes("twitter.com") || raw.includes("x.com")) return "x";
  if (raw.includes("pinterest.com")) return "pinterest";
  if (raw.includes("threads.net")) return "threads";
  return undefined;
}

export function resolveNetwork(
  handle: Pick<SocialMediaUsername, "network" | "url">,
): SocialMediaNetwork {
  return handle.network ?? networkFromUrl(handle.url) ?? "instagram";
}
