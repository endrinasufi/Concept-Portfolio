"use client";

import type { SocialMediaFeedPost, SocialMediaProject } from "@/types/social-media";
import { socialMediaContentClass } from "@/lib/social-media/layout";
import { sortByOrder } from "@/lib/utils/id";
import { SocialMediaFeedWindow } from "./SocialMediaFeedWindow";
import { SocialMediaPhoneMockup } from "./SocialMediaPhoneMockup";

export function SocialMediaBlock1({
  project,
  onOpenFeed,
}: {
  project: SocialMediaProject;
  onOpenFeed: (post: SocialMediaFeedPost, index: number) => void;
}) {
  const handles = sortByOrder(project.usernames);

  const mockups = [
    {
      mediaId: project.block1.mockupImage1MediaId,
      imageUrl: project.block1.mockupImage1Url,
      alt: "Mockup 1",
    },
    {
      mediaId: project.block1.mockupImage2MediaId,
      imageUrl: project.block1.mockupImage2Url,
      alt: "Mockup 2",
    },
  ] as const;

  return (
    <section className="relative z-10 overflow-visible pb-12 pt-[calc(var(--header-offset))] md:pb-16 lg:pb-20">
      <div className={`${socialMediaContentClass} overflow-visible`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-600 md:text-xs">
          {project.serviceLabel}
        </p>

        <div className="mt-3 grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-stretch lg:gap-8 xl:gap-12">
          <div className="flex min-w-0 flex-col lg:h-full">
            <h1 className="text-[clamp(2.75rem,5.5vw,5rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.03em] text-neutral-950 [font-family:var(--font-sm-display)]">
              {project.clientName}
            </h1>

            {handles.length ? (
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                {handles.map((handle) => (
                  <li key={handle.id}>
                    <a
                      href={handle.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-neutral-700 underline decoration-neutral-400/60 underline-offset-4 transition hover:text-neutral-950 hover:decoration-neutral-900"
                    >
                      {handle.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-10 flex items-end justify-start gap-6 sm:gap-8 md:mt-12 md:gap-10 lg:mt-auto lg:pt-4">
              {mockups.map((mockup, i) => (
                <SocialMediaPhoneMockup
                  key={i}
                  mediaId={mockup.mediaId}
                  imageUrl={mockup.imageUrl}
                  alt={mockup.alt}
                />
              ))}
            </div>
          </div>

          <div className="w-full min-w-0 overflow-visible lg:flex lg:justify-end">
            <SocialMediaFeedWindow
              posts={project.block1?.feedPosts ?? []}
              onOpen={onOpenFeed}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
