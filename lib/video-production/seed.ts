import type { VideoProductionItem } from "@/types/video-production";
import { nowIso } from "@/lib/utils/id";

const CLIENTS: { name: string; accent: string }[] = [
  { name: "Aurora Café", accent: "#C4A574" },
  { name: "Nordic Brew", accent: "#7dccb3" },
  { name: "Atelier Luce", accent: "#f19a2a" },
  { name: "Verde Market", accent: "#8FBF6A" },
  { name: "Studio Forma", accent: "#E8A0BF" },
  { name: "Peak Athletics", accent: "#5B8DEF" },
  { name: "Casa Bianca", accent: "#D4C4A8" },
  { name: "Orbit Tech", accent: "#6EE7D8" },
  { name: "Lumi Travel", accent: "#F0A06A" },
  { name: "Ember Kitchen", accent: "#E07A5F" },
];

const SOCIAL_TITLES = [
  "Product Reel",
  "Social Cut",
  "Story Spot",
  "Launch Reel",
  "Menu Story",
  "Behind the Scenes",
  "Campaign Cut",
  "Closing Reel",
  "Daily Moment",
  "Highlight",
];

const PRODUCTION_TITLES = [
  "Brand Film",
  "Launch Spot",
  "Studio Session",
  "Aftermovie",
  "Campaign Spot",
  "Documentary Cut",
];

const YOUTUBE_IDS = [
  "dQw4w9WgXcQ",
  "jNQXAC9IVRw",
  "M7lc1UVf-VE",
  "LXb3EKWsInQ",
  "ScMzIvxBSi4",
  "kJQP7kiw5Fk",
  "9bZkp7q19f0",
  "fJ9rUzIMcZQ",
  "RgKAFK5djSk",
  "OPf0YbXqDm0",
  "CevxZvSJLk8",
  "hT_nvWreIhg",
  "YQHsXMglC9A",
  "2Vv-BfVoq4g",
  "JGwWNGJdvx8",
  "pRpeEdMmmQ0",
  "09R8_2nJtjg",
  "60ItHLz5WEA",
  "fKopy74weus",
  "e-ORhEE9VVg",
];

/** Seed — reels (social) + video horizontale (production). */
export function createSeedVideoProductionItems(): VideoProductionItem[] {
  const now = nowIso();
  const items: VideoProductionItem[] = [];
  let order = 0;

  // Social Media — reels (portrait): 10 klientë × 10
  CLIENTS.forEach((client, ci) => {
    for (let vi = 0; vi < 10; vi++) {
      const global = ci * 10 + vi;
      items.push({
        id: `vp-seed-v8-social-${ci + 1}-${vi + 1}`,
        title: SOCIAL_TITLES[vi],
        clientName: client.name,
        youtubeId: YOUTUBE_IDS[global % YOUTUBE_IDS.length],
        description: `${SOCIAL_TITLES[vi]} për ${client.name}.`,
        orientation: "portrait",
        accentColor: client.accent,
        status: "published",
        order: order++,
        createdAt: now,
        updatedAt: now,
      });
    }
  });

  // Production — horizontale: 8 klientë × 6
  CLIENTS.slice(0, 8).forEach((client, ci) => {
    for (let vi = 0; vi < 6; vi++) {
      const global = ci * 6 + vi;
      items.push({
        id: `vp-seed-v8-prod-${ci + 1}-${vi + 1}`,
        title: PRODUCTION_TITLES[vi],
        clientName: client.name,
        youtubeId: YOUTUBE_IDS[(global + 3) % YOUTUBE_IDS.length],
        description: `${PRODUCTION_TITLES[vi]} për ${client.name}.`,
        orientation: "landscape",
        accentColor: client.accent,
        status: "published",
        order: order++,
        createdAt: now,
        updatedAt: now,
      });
    }
  });

  return items;
}
