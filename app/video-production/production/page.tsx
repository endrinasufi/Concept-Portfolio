import { VideoProductionPageClient } from "@/components/video-production/VideoProductionPageClient";

export const metadata = {
  title: "Video · Production",
  description: "Video production — Concept Marketing Albania",
};

export default function VideoProductionTabPage() {
  return <VideoProductionPageClient view="production" />;
}
