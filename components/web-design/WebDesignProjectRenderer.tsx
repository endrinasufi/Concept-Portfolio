"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import type { WebDesignProject } from "@/types/web-design";
import { sortByOrder } from "@/lib/utils/id";
import { WebDesignProjectInfo } from "./WebDesignProjectInfo";
import { WebDesignFeaturedVisual } from "./WebDesignFeaturedVisual";
import { WebDesignGalleryCarousel } from "./WebDesignGalleryCarousel";
import { WebDesignLightbox } from "./WebDesignLightbox";

export function WebDesignProjectRenderer({
  project,
  index,
  total,
  isPreview = false,
}: {
  project: WebDesignProject;
  index: number;
  total: number;
  isPreview?: boolean;
}) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const gallery = useMemo(
    () => sortByOrder(project.gallery),
    [project.gallery],
  );
  const bg = project.appearance.pageBackgroundColor || "#0B0B0C";
  const text = project.appearance.textColor || "#F4F1EA";

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ backgroundColor: bg, color: text }}
    >
      {isPreview && project.status === "draft" ? (
        <div className="relative z-30 mx-auto max-w-[100rem] px-5 pt-[calc(var(--header-offset))] md:px-8">
          <div className="rounded-full border border-amber-500/30 bg-amber-100/90 px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-900">
            Preview · Draft
          </div>
        </div>
      ) : null}

      <section className="px-5 pt-[calc(var(--header-offset)+0.5rem)] pb-10 md:px-8 md:pb-12 lg:px-10 lg:pt-[calc(var(--header-offset)+0.85rem)] lg:pb-14 xl:px-14">
        <div className="mx-auto grid w-full max-w-[110rem] items-stretch gap-6 lg:grid-cols-[minmax(13rem,20%)_minmax(0,1fr)] lg:gap-7 xl:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-0 self-stretch"
          >
            <WebDesignProjectInfo
              project={project}
              index={index}
              total={total}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
            className="min-w-0 self-stretch"
          >
            <WebDesignFeaturedVisual visual={project.featuredVisual} />
          </motion.div>
        </div>
      </section>

      <div className="px-5 pt-4 pb-20 md:px-8 md:pt-6 lg:px-10 lg:pt-8 xl:px-14">
        <div className="mx-auto w-full max-w-[110rem]">
          <WebDesignGalleryCarousel
            items={gallery}
            onOpen={(i) => setLightbox(i)}
          />
        </div>
      </div>

      <WebDesignLightbox
        items={gallery}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onPrev={() =>
          setLightbox((i) =>
            i === null ? null : (i - 1 + gallery.length) % gallery.length,
          )
        }
        onNext={() =>
          setLightbox((i) => (i === null ? null : (i + 1) % gallery.length))
        }
      />
    </div>
  );
}
