"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  VideoPageHeader,
  type VideoPageView,
} from "@/components/video-production/VideoViewSwitcher";
import { FadeIn } from "@/components/motion/Reveal";

function viewFromPath(pathname: string | null): VideoPageView {
  if (pathname?.includes("/production")) return "production";
  return "social";
}

/** Layout i qëndrueshëm — switcher nuk rimonton, kështu liquid animon. */
export function VideoProductionShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const view = viewFromPath(pathname);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--project-bg", "#0E0F11");
    return () => {
      root.style.removeProperty("--project-bg");
    };
  }, []);

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: "#0E0F11" }}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] opacity-80"
        style={{
          background:
            "radial-gradient(70% 50% at 50% -10%, rgba(212,165,116,0.14), transparent 60%)",
        }}
        aria-hidden
      />

      <div className="relative z-[1] mx-auto max-w-7xl px-5 pb-24 pt-[var(--header-offset)] md:px-8">
        <FadeIn>
          <VideoPageHeader active={view} />
        </FadeIn>
        {children}
      </div>
    </div>
  );
}
