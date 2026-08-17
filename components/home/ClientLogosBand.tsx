"use client";

import { MediaImage } from "@/components/branding/MediaImage";
import { Reveal } from "@/components/motion/Reveal";
import { sortByOrder } from "@/lib/utils/id";
import type { ClientLogo } from "@/types/settings";
import { useMemo } from "react";

export function ClientLogosBand({ logos }: { logos: ClientLogo[] }) {
  const sorted = useMemo(() => sortByOrder(logos), [logos]);

  if (!sorted.length) return null;

  return (
    <section className="border-t border-border px-5 py-14 md:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted">
            Klientët
          </p>
        </Reveal>

        <div className="mt-8 grid grid-cols-3 gap-x-6 gap-y-8 sm:grid-cols-4 md:mt-10 md:grid-cols-6 md:gap-x-10 md:gap-y-12 lg:grid-cols-8">
          {sorted.map((logo) => (
            <div
              key={logo.id}
              className="relative flex aspect-[5/3] items-center justify-center"
            >
              <MediaImage
                mediaId={logo.mediaId}
                alt="Logo klienti"
                fit="contain"
                className="max-h-10 max-w-[85%] opacity-70 md:max-h-12"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
