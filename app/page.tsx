import type { Metadata } from "next";
import { HomeScrollExperience } from "@/components/home/HomeScrollExperience";
import {
  loadPublishedBranding,
  loadPublishedSocial,
  loadPublishedVideo,
  loadPublishedWebDesign,
  loadSiteSettings,
} from "@/lib/server/publicData";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Concept Marketing Albania",
  description:
    "Concept Marketing Albania portfolio — branding, social media, web design, video, and photoshooting.",
};

export default async function HomePage() {
  const [brandingProjects, socialProjects, videoItems, webDesignProjects, settings] =
    await Promise.all([
      loadPublishedBranding(),
      loadPublishedSocial(),
      loadPublishedVideo(),
      loadPublishedWebDesign(),
      loadSiteSettings(),
    ]);

  return (
    <div className="editorial-grain relative z-0 overflow-x-hidden bg-background">
      <HomeScrollExperience
        initialBrandingProjects={brandingProjects}
        initialSocialProjects={socialProjects}
        initialVideoItems={videoItems}
        initialWebDesignProjects={webDesignProjects}
        initialSettings={settings}
      />
    </div>
  );
}
