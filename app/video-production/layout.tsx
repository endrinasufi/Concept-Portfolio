"use client";

import { VideoProductionShell } from "@/components/video-production/VideoProductionShell";

export default function VideoProductionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <VideoProductionShell>{children}</VideoProductionShell>;
}
