import type { SocialMediaProject } from "@/types/social-media";
import { defaultBlock2, defaultPageAppearance } from "@/types/social-media";
import { createId, nowIso } from "@/lib/utils/id";

const u = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export function createSeedSocialMediaProjects(): SocialMediaProject[] {
  const stamp = nowIso();

  const feedIds = [
    "photo-1495474472287-4d71bcdd2085",
    "photo-1509042239860-f550ce710b93",
    "photo-1442512595331-e89e7387613f",
    "photo-1511920170033-f8396924c348",
    "photo-1461023058943-07fcbe16d735",
    "photo-1498804103079-a6351b050096",
    "photo-1514432324607-a09d9b4aefdd",
    "photo-1485808191679-5f86510681a2",
    "photo-1501339847302-ac426a4a7cbb",
    "photo-1559925393-8be0ec67e0e1",
    "photo-1521017432531-fbd92d768814",
    "photo-1453614512568-c4024d13c247",
    "photo-1514432324607-a09d9b4aefdd",
    "photo-1495474472287-4d71bcdd2085",
    "photo-1509042239860-f550ce710b93",
  ];

  return [
    {
      id: createId(),
      service: "social-media",
      slug: "aurora-cafe-social",
      title: "Aurora Café — Social",
      clientName: "Aurora Café",
      serviceLabel: "Social Media Management",
      usernames: [
        {
          id: createId(),
          label: "aurora.cafe",
          url: "https://instagram.com/",
          network: "instagram",
          order: 0,
        },
        {
          id: createId(),
          label: "auroracafe",
          url: "https://tiktok.com/",
          network: "tiktok",
          order: 1,
        },
      ],
      status: "published",
      order: 0,
      pageAppearance: {
        ...defaultPageAppearance(),
        lineColor: "#2a2420",
      },
      block1: {
        mockupImage1Url: u("photo-1511920170033-f8396924c348", 700),
        mockupImage2Url: u("photo-1495474472287-4d71bcdd2085", 700),
        feedPosts: feedIds.map((id, i) => ({
          id: createId(),
          imageUrl: u(id, 900),
          alt: `Feed post ${i + 1}`,
          caption: `Post ${i + 1}`,
          order: i,
          objectPosition: "50% 50%",
        })),
      },
      block2: {
        ...defaultBlock2(),
        title: "Building a ritual online",
        audience:
          "Young professionals and design-aware locals who treat coffee as a daily pause — not just a drink.",
        projectChallenge:
          "Translate the warmth of the physical café into a consistent social presence without sounding generic or overly promotional.",
        result:
          "A refined content system across Feed, Stories and Reels that grew reach, engagement and community recognition over six months.",
        backgroundColors: ["#120e14", "#2c1822", "#080a10"],
        grainStrength: 0.6,
        reels: Array.from({ length: 6 }, (_, i) => ({
          id: createId(),
          thumbnailUrl: u(
            [
              "photo-1521017432531-fbd92d768814",
              "photo-1453614512568-c4024d13c247",
              "photo-1495474472287-4d71bcdd2085",
              "photo-1511920170033-f8396924c348",
              "photo-1509042239860-f550ce710b93",
              "photo-1442512595331-e89e7387613f",
            ][i]!,
            700,
          ),
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          title: `Reel ${i + 1}`,
          order: i,
        })),
      },
      block3: {
        stories: Array.from({ length: 10 }, (_, i) => ({
          id: createId(),
          imageUrl: u(
            [
              "photo-1511920170033-f8396924c348",
              "photo-1495474472287-4d71bcdd2085",
              "photo-1509042239860-f550ce710b93",
              "photo-1442512595331-e89e7387613f",
              "photo-1461023058943-07fcbe16d735",
              "photo-1498804103079-a6351b050096",
              "photo-1514432324607-a09d9b4aefdd",
              "photo-1485808191679-5f86510681a2",
              "photo-1501339847302-ac426a4a7cbb",
              "photo-1559925393-8be0ec67e0e1",
            ][i]!,
            600,
          ),
          alt: `Story ${i + 1}`,
          title: `Story ${i + 1}`,
          order: i,
        })),
      },
      seo: {
        metaTitle: "Aurora Café — Social Media Management",
        metaDescription:
          "Case study Social Media Management për Aurora Café nga Concept Marketing Albania.",
      },
      createdAt: stamp,
      updatedAt: stamp,
    },
  ];
}
