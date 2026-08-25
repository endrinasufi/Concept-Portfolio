"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useVideoProduction } from "@/lib/hooks/useVideoProduction";
import {
  youtubeEmbedUrl,
  youtubeThumbnailUrl,
} from "@/lib/video-production/youtube";
import {
  normalizeVideoOrientation,
  type VideoProductionItem,
} from "@/types/video-production";
import type { VideoPageView } from "@/components/video-production/VideoViewSwitcher";
import { Reveal } from "@/components/motion/Reveal";
import { Play, X } from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const INITIAL_SOCIAL = 10;
const INITIAL_PRODUCTION = 6;
const LOAD_MORE = 10;

function VideoCard({
  video,
  landscape,
  onPlay,
}: {
  video: VideoProductionItem;
  landscape: boolean;
  onPlay: (video: VideoProductionItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPlay(video)}
      className="group flex h-full w-full flex-col text-left"
    >
      <div
        className={`relative w-full overflow-hidden rounded-[1.5rem] bg-surface md:rounded-[1.75rem] ${
          landscape ? "aspect-video" : "aspect-[9/16]"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={youtubeThumbnailUrl(video.youtubeId)}
          alt={video.title}
          className={`absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 object-cover transition duration-700 ease-out group-hover:scale-[1.04] ${
            landscape
              ? "min-h-[130%] min-w-[130%]"
              : "min-h-[155%] min-w-[155%]"
          }`}
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-black/10 transition duration-500 group-hover:bg-transparent" />
        <span className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-black">
            <Play size={16} fill="currentColor" className="ml-0.5" />
          </span>
        </span>
      </div>

      <div className={`mt-5 min-w-0 flex-1 ${inter.className}`}>
        <h2 className="text-lg font-semibold leading-[1.15] tracking-tight text-foreground transition duration-300 group-hover:text-accent md:text-xl">
          {video.title}
        </h2>
        {video.clientName ? (
          <p className="mt-2 text-sm text-muted">{video.clientName}</p>
        ) : null}
      </div>
    </button>
  );
}

function VideoLightbox({
  video,
  landscape,
  onClose,
}: {
  video: VideoProductionItem;
  landscape: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal
      aria-label={video.title}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-5 text-white/50 transition hover:text-white"
        aria-label="Close"
      >
        <X size={22} />
      </button>
      <div
        className={`w-full ${
          landscape ? "max-w-5xl" : "max-w-[min(100%,400px)]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`relative w-full overflow-hidden rounded-[1.5rem] bg-black md:rounded-[1.75rem] ${
            landscape ? "aspect-video" : "aspect-[9/16] max-h-[82vh]"
          }`}
        >
          <iframe
            src={youtubeEmbedUrl(video.youtubeId)}
            title={video.title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className={`mt-5 ${inter.className}`}>
          <p className="text-lg font-semibold text-white">{video.title}</p>
          {video.clientName ? (
            <p className="mt-1 text-sm text-white/45">{video.clientName}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function VideoProductionPageClient({
  view,
  initialVideos,
}: {
  view: VideoPageView;
  initialVideos?: VideoProductionItem[];
}) {
  const { videos, loading } = useVideoProduction({
    enabled: initialVideos === undefined,
    initial: initialVideos,
  });
  const [playing, setPlaying] = useState<VideoProductionItem | null>(null);
  const [visibleCount, setVisibleCount] = useState(
    view === "social" ? INITIAL_SOCIAL : INITIAL_PRODUCTION,
  );

  const landscape = view === "production";

  useEffect(() => {
    setVisibleCount(view === "social" ? INITIAL_SOCIAL : INITIAL_PRODUCTION);
    setPlaying(null);
  }, [view]);

  const filtered = useMemo(
    () =>
      videos.filter((v) => {
        const o = normalizeVideoOrientation(v.orientation);
        return landscape ? o === "landscape" : o === "portrait";
      }),
    [videos, landscape],
  );

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const loadMore = useCallback(() => {
    setVisibleCount((n) => Math.min(n + LOAD_MORE, filtered.length));
  }, [filtered.length]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted">
        Loading…
      </div>
    );
  }

  return (
    <>
      {filtered.length === 0 ? (
        <p className={`mt-16 text-muted ${inter.className}`}>
          {view === "social"
            ? "No social media videos yet."
            : "No video production yet."}
        </p>
      ) : (
        <>
          <div
            className={
              landscape
                ? "mt-12 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 md:mt-16 md:gap-y-16 lg:grid-cols-3"
                : "mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:mt-16 md:gap-x-8 md:gap-y-12 lg:grid-cols-5 lg:gap-x-8 lg:gap-y-14"
            }
          >
            {visible.map((video, i) => (
              <Reveal key={video.id} delay={Math.min(i * 0.04, 0.2)}>
                <VideoCard
                  video={video}
                  landscape={landscape}
                  onPlay={setPlaying}
                />
              </Reveal>
            ))}
          </div>

          {hasMore ? (
            <div className="mt-12 flex justify-center md:mt-16">
              <button
                type="button"
                onClick={loadMore}
                className={`text-sm text-muted transition hover:text-accent ${inter.className}`}
              >
                More
              </button>
            </div>
          ) : null}
        </>
      )}

      {playing ? (
        <VideoLightbox
          video={playing}
          landscape={landscape}
          onClose={() => setPlaying(null)}
        />
      ) : null}
    </>
  );
}
