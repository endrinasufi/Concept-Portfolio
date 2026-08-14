"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { SocialMediaBlock2 as Block2, SocialMediaReel } from "@/types/social-media";
import { socialMediaContentClass } from "@/lib/social-media/layout";
import { MediaImage } from "@/components/branding/MediaImage";
import { sortByOrder } from "@/lib/utils/id";
import { useResolvedSrc } from "@/lib/hooks/useMediaUrl";
import {
  extractYoutubeId,
  youtubeEmbedUrl,
  youtubeReelThumbProps,
} from "@/lib/video-production/youtube";

function grainStyle(strength: number): CSSProperties {
  const opacity = Math.min(1, Math.max(0, strength)) * 0.65;
  return {
    opacity,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    backgroundSize: "160px 160px",
    mixBlendMode: "overlay",
  };
}

function cardBackground(colors: string[]): string {
  const c = colors.filter(Boolean);
  if (c.length >= 3) {
    return `linear-gradient(128deg, ${c[0]} 0%, ${c[1]} 45%, ${c[2]} 100%)`;
  }
  if (c.length === 2) {
    return `linear-gradient(128deg, ${c[0]} 0%, ${c[1]} 100%)`;
  }
  return c[0] || "#141018";
}

function ytCommand(
  iframe: HTMLIFrameElement | null,
  func: string,
  args: unknown[] = [],
) {
  iframe?.contentWindow?.postMessage(
    JSON.stringify({ event: "command", func, args }),
    "*",
  );
}

function ReelCard({
  reel,
  playing,
  onToggle,
}: {
  reel: SocialMediaReel;
  playing: boolean;
  onToggle: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ytLive, setYtLive] = useState(false);
  const [iframeOn, setIframeOn] = useState(false);
  const youtubeId = extractYoutubeId(reel.videoUrl ?? "");
  const fileSrc = useResolvedSrc({
    mediaId: reel.videoMediaId,
    imageUrl: youtubeId ? undefined : reel.videoUrl,
  });

  useEffect(() => {
    if (!playing) {
      setIframeOn(false);
      setYtLive(false);
      return;
    }
    if (!youtubeId) return;
    const t = window.setTimeout(() => setIframeOn(true), 120);
    return () => window.clearTimeout(t);
  }, [playing, youtubeId]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (!playing) {
      el.pause();
      return;
    }
    el.muted = true;
    const start = () => {
      void el.play().catch(() => undefined);
    };
    if (el.readyState >= 2) start();
    else el.addEventListener("canplay", start, { once: true });
  }, [playing, fileSrc]);

  useEffect(() => {
    if (!playing || !youtubeId || !iframeOn) return;
    const iframe = iframeRef.current;
    let playingOnce = false;

    const kick = () => {
      ytCommand(iframe, "playVideo");
      iframe?.contentWindow?.postMessage(
        JSON.stringify({ event: "listening", id: reel.id }),
        "*",
      );
      ytCommand(iframe, "addEventListener", ["onStateChange"]);
    };

    const onMessage = (event: MessageEvent) => {
      let data: unknown = event.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data) as unknown;
        } catch {
          return;
        }
      }
      if (!data || typeof data !== "object") return;
      const payload = data as { event?: string; info?: number };
      if (payload.event !== "onStateChange") return;
      if (payload.info === 1) {
        setYtLive(true);
        if (!playingOnce) {
          playingOnce = true;
          window.setTimeout(() => ytCommand(iframeRef.current, "unMute"), 400);
        }
      }
      if (payload.info === 2 || payload.info === 5) {
        ytCommand(iframeRef.current, "playVideo");
      }
      if (payload.info === 0) {
        ytCommand(iframeRef.current, "playVideo");
      }
    };

    const timer = window.setInterval(kick, 500);
    const stop = window.setTimeout(() => window.clearInterval(timer), 2500);
    iframe?.addEventListener("load", kick);
    window.addEventListener("message", onMessage);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(stop);
      iframe?.removeEventListener("load", kick);
      window.removeEventListener("message", onMessage);
    };
  }, [playing, youtubeId, iframeOn, reel.id]);

  function handlePress(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  }

  const showPoster = !playing || (Boolean(youtubeId) && !ytLive);

  return (
    <div
      data-reel-card
      className="relative w-[calc((100%-0.75rem)/2)] min-w-[calc((100%-0.75rem)/2)] shrink-0 snap-start overflow-hidden rounded-[1.25rem] border border-white/10 bg-black/30 sm:w-[calc((100%-1rem)/2)] sm:min-w-[calc((100%-1rem)/2)] md:rounded-[1.35rem]"
    >
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-black">
        {showPoster ? (
          <MediaImage
            mediaId={reel.thumbnailMediaId}
            {...youtubeReelThumbProps(reel)}
            alt={reel.title ?? "Reel"}
            fit="cover"
          />
        ) : null}

        {iframeOn && youtubeId ? (
          <iframe
            ref={iframeRef}
            src={youtubeEmbedUrl(youtubeId, {
              autoplay: true,
              controls: false,
              mute: true,
              enableJsApi: true,
            })}
            title={reel.title ?? "Reel"}
            width={1280}
            height={720}
            tabIndex={-1}
            allow="autoplay; encrypted-media"
            className="pointer-events-none absolute left-1/2 top-0 z-[1] h-full max-w-none -translate-x-1/2 border-0"
            style={{ aspectRatio: "16 / 9", width: "auto" }}
          />
        ) : null}

        {playing && fileSrc && !youtubeId ? (
          <video
            ref={videoRef}
            src={fileSrc}
            playsInline
            loop
            muted
            autoPlay
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
            className="reel-inline-video pointer-events-none absolute inset-0 z-[1] h-full w-full object-contain"
          />
        ) : null}

        <button
          type="button"
          onPointerDown={(e) => e.preventDefault()}
          onClick={handlePress}
          className="absolute inset-0 z-10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          aria-label={playing ? "Ndalo reel" : "Luaj reel"}
        >
          {playing ? null : (
            <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-sm">
              <Play size={14} className="ml-0.5 text-white" fill="currentColor" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

export function SocialMediaBlock2({ block2 }: { block2: Block2 }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const reels = sortByOrder(block2.reels);
  const [playingId, setPlayingId] = useState<string | null>(null);

  function scrollBy(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-reel-card]");
    const gap = 16;
    const amount = card ? card.offsetWidth + gap : el.clientWidth * 0.5;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  return (
    <section className="relative z-20 pt-4 md:pt-6 lg:pt-8">
      <div className={socialMediaContentClass}>
        <div
          className="relative w-full rounded-[2rem] border border-white/[0.08] text-white shadow-[0_0_18px_rgba(0,0,0,0.14),0_0_6px_rgba(0,0,0,0.08)] md:rounded-[2.25rem]"
          style={{ backgroundImage: cardBackground(block2.backgroundColors) }}
        >
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
          style={grainStyle(block2.grainStrength)}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] bg-gradient-to-br from-white/[0.06] via-transparent to-black/20"
          aria-hidden
        />

        <div className="relative grid gap-6 p-8 sm:p-10 md:grid-cols-12 md:gap-x-12 md:p-12 lg:gap-x-16 lg:p-14 xl:p-16">
          <div className="md:col-span-5 md:row-start-1 md:max-w-[min(100%,26rem)] lg:max-w-[min(100%,30rem)]">
            <h2 className="text-[clamp(2rem,3.2vw,3.75rem)] font-bold uppercase leading-[1.02] tracking-[-0.02em] [font-family:var(--font-sm-display)] md:pt-12">
              {block2.title || "Project overview"}
            </h2>

            <div className="mt-4 space-y-4.5 md:space-y-5">
              {[
                { label: "Audience", body: block2.audience },
                { label: "Project challenge", body: block2.projectChallenge },
                { label: "Result", body: block2.result },
              ].map((item) =>
                item.body ? (
                  <div key={item.label}>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/45">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-justify text-[14px] leading-[1.35] text-white/78 md:text-[15px] lg:text-base md:leading-[1.38]">
                      {item.body}
                    </p>
                  </div>
                ) : null,
              )}
            </div>
          </div>

          <div className="md:col-span-7 md:col-start-6 md:row-start-1">
            <div className="mb-3 flex items-center justify-between gap-3 md:mb-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/45">
                Reels
              </p>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollBy(-1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:bg-white/10"
                  aria-label="Reels e mëparshme"
                >
                  <ChevronLeft size={14} strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollBy(1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:bg-white/10"
                  aria-label="Reels tjetër"
                >
                  <ChevronRight size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div
              ref={scrollerRef}
              className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden"
            >
              {reels.map((reel) => (
                <ReelCard
                  key={reel.id}
                  reel={reel}
                  playing={playingId === reel.id}
                  onToggle={() =>
                    setPlayingId((id) => (id === reel.id ? null : reel.id))
                  }
                />
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
