import { VideoProductionPageClient } from "@/components/video-production/VideoProductionPageClient";
import { loadPublishedVideo } from "@/lib/server/publicData";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Video · Production",
  description: "Video production — Concept Marketing Albania",
};

export default async function VideoProductionTabPage() {
  const videos = await loadPublishedVideo();
  return (
    <VideoProductionPageClient view="production" initialVideos={videos} />
  );
}
