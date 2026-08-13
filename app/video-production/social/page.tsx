import { VideoProductionPageClient } from "@/components/video-production/VideoProductionPageClient";
import { loadPublishedVideo } from "@/lib/server/publicData";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Video · Social Media",
  description: "Video social media (reels) — Concept Marketing Albania",
};

export default async function VideoSocialPage() {
  const videos = await loadPublishedVideo();
  return <VideoProductionPageClient view="social" initialVideos={videos} />;
}
