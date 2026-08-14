"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  SocialMediaFeedPost,
  SocialMediaProject,
  SocialMediaStory,
} from "@/types/social-media";
import { sortByOrder } from "@/lib/utils/id";
import { socialMediaContentClass } from "@/lib/social-media/layout";
import { SocialMediaBlock1 } from "./SocialMediaBlock1";
import { SocialMediaBlock2 } from "./SocialMediaBlock2";
import { SocialMediaBlock3 } from "./SocialMediaBlock3";
import {
  SocialMediaMediaViewer,
  type SocialMediaViewerItem,
} from "./SocialMediaMediaViewer";

type ViewerState =
  | { mode: "feed"; index: number }
  | { mode: "story"; story: SocialMediaStory }
  | null;

export function SocialMediaProjectRenderer({
  project,
  isPreview = false,
}: {
  project: SocialMediaProject;
  isPreview?: boolean;
}) {
  const [viewer, setViewer] = useState<ViewerState>(null);
  const feed = useMemo(
    () => sortByOrder(project.block1.feedPosts),
    [project.block1.feedPosts],
  );
  const stories = useMemo(
    () => sortByOrder(project.block3.stories),
    [project.block3.stories],
  );
  const bg = project.pageAppearance.backgroundColor || "#EAEAEA";

  const openFeed = useCallback((_post: SocialMediaFeedPost, index: number) => {
    setViewer({ mode: "feed", index });
  }, []);

  const viewerItem: SocialMediaViewerItem | null = useMemo(() => {
    if (!viewer) return null;
    if (viewer.mode === "feed") {
      const post = feed[viewer.index];
      if (!post) return null;
      return {
        type: "image",
        mediaId: post.mediaId,
        imageUrl: post.imageUrl,
        alt: post.alt,
        title: post.caption,
      };
    }
    const storyIndex = stories.findIndex((s) => s.id === viewer.story.id);
    return {
      type: "image",
      mediaId: viewer.story.mediaId,
      imageUrl: viewer.story.imageUrl,
      alt: viewer.story.alt,
      title: storyIndex >= 0 ? `Story ${storyIndex + 1}` : viewer.story.title,
    };
  }, [viewer, feed, stories]);

  return (
    <div
      className="relative min-h-screen overflow-x-hidden text-neutral-900"
      style={{ backgroundColor: bg }}
    >
      {isPreview && project.status === "draft" ? (
        <div className={`relative z-30 ${socialMediaContentClass} pt-[calc(var(--header-offset))]`}>
          <div className="rounded-full border border-amber-600/30 bg-amber-100/90 px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-900">
            Preview · Draft
          </div>
        </div>
      ) : null}

      <SocialMediaBlock1 project={project} onOpenFeed={openFeed} />

      <SocialMediaBlock2 block2={project.block2} />

      <SocialMediaBlock3
        stories={project.block3.stories}
        onOpen={(story) => setViewer({ mode: "story", story })}
      />

      <SocialMediaMediaViewer
        item={viewerItem}
        onClose={() => setViewer(null)}
        hasPrev={viewer?.mode === "feed" ? viewer.index > 0 : false}
        hasNext={
          viewer?.mode === "feed" ? viewer.index < feed.length - 1 : false
        }
        onPrev={
          viewer?.mode === "feed"
            ? () =>
                setViewer({
                  mode: "feed",
                  index: Math.max(0, viewer.index - 1),
                })
            : undefined
        }
        onNext={
          viewer?.mode === "feed"
            ? () =>
                setViewer({
                  mode: "feed",
                  index: Math.min(feed.length - 1, viewer.index + 1),
                })
            : undefined
        }
      />
    </div>
  );
}
