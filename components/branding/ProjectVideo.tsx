"use client";

import { useMediaUrl } from "@/lib/hooks/useMediaUrl";
import { Reveal } from "@/components/motion/Reveal";

export function ProjectVideo({ videoMediaId }: { videoMediaId?: string }) {
  const url = useMediaUrl(videoMediaId);
  if (!videoMediaId || !url) return null;

  return (
    <Reveal>
      <section className="mt-16 w-full md:mt-24">
        <div className="overflow-hidden rounded-[1.35rem] bg-surface md:rounded-[1.6rem]">
          <video
            src={url}
            controls
            playsInline
            className="aspect-video w-full bg-black object-contain"
          />
        </div>
      </section>
    </Reveal>
  );
}
