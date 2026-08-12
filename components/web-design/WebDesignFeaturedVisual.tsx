"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "motion/react";
import { Hand } from "lucide-react";
import type { WebDesignProject } from "@/types/web-design";
import {
  WEB_DESIGN_FEATURED_FRAMES,
  WEB_DESIGN_MOBILE_HEIGHT_REL,
} from "@/types/web-design";
import { MediaImage } from "@/components/branding/MediaImage";

function hexToRgba(hex: string, alpha: number): string {
  const raw = hex.replace("#", "").trim();
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  const n = Number.parseInt(full.slice(0, 6), 16);
  if (Number.isNaN(n)) return `rgba(0,0,0,${alpha})`;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function ScrollableMockup({
  className,
  style,
  children,
  delay = 0.1,
}: {
  className: string;
  style?: CSSProperties;
  children: ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [showFinger, setShowFinger] = useState(false);
  const dismissed = useRef(false);
  const started = useRef(false);

  const tryShowHint = useCallback(() => {
    const el = ref.current;
    if (!el || dismissed.current || started.current) return;
    const overflow = el.scrollHeight > el.clientHeight + 8;
    if (!overflow) return;
    started.current = true;
    setShowFinger(true);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      if (dismissed.current) return;
      if (el.scrollHeight > el.clientHeight + 8) tryShowHint();
    };

    check();
    const t1 = window.setTimeout(check, 400);
    const t2 = window.setTimeout(check, 1200);
    const ro = new ResizeObserver(check);
    ro.observe(el);

    const onImgLoad = () => check();
    const bindImg = (img: HTMLImageElement) => {
      if (img.complete) check();
      else img.addEventListener("load", onImgLoad);
    };
    el.querySelectorAll("img").forEach((img) => bindImg(img as HTMLImageElement));

    const mo = new MutationObserver(() => {
      el.querySelectorAll("img").forEach((img) => bindImg(img as HTMLImageElement));
      check();
    });
    mo.observe(el, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      ro.disconnect();
      mo.disconnect();
    };
  }, [tryShowHint]);

  useEffect(() => {
    if (!showFinger) return;
    const hide = window.setTimeout(() => {
      dismissed.current = true;
      setShowFinger(false);
    }, 2600);
    return () => window.clearTimeout(hide);
  }, [showFinger]);

  function onScroll() {
    const el = ref.current;
    if (!el) return;
    if (el.scrollTop > 4) {
      dismissed.current = true;
      setShowFinger(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={`relative ${className}`}
      style={style}
    >
      <div
        ref={ref}
        onScroll={onScroll}
        className="h-full min-h-0 overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {showFinger ? (
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
          aria-hidden
        >
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{
              opacity: [0, 0.55, 0.55, 0],
              y: [-12, 0, 16, 28],
            }}
            transition={{
              duration: 2.4,
              ease: "easeInOut",
              times: [0, 0.12, 0.75, 1],
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-black/35 text-white shadow-[0_4px_20px_rgba(0,0,0,0.35)] backdrop-blur-[2px]"
          >
            <Hand size={26} strokeWidth={1.75} className="-rotate-[25deg]" />
          </motion.div>
        </div>
      ) : null}
    </motion.div>
  );
}

export function WebDesignFeaturedVisual({
  visual,
}: {
  visual: WebDesignProject["featuredVisual"];
}) {
  const overlay = Math.min(1, Math.max(0, visual.backgroundOverlay ?? 0.42));
  const overlayColor = visual.backgroundOverlayColor || "#000000";
  const blur = Math.min(80, Math.max(0, visual.backgroundBlur ?? 18));
  const desktopScale = visual.desktopScale || 1;
  const mobileScale = visual.mobileScale || 1;

  return (
    <div className="relative mx-auto aspect-[16/9.5] w-full max-h-[calc(100svh-var(--header-offset)-2.75rem)] max-w-[min(100%,calc((100svh-var(--header-offset)-2.75rem)*16/9.5))] overflow-hidden rounded-[1.5rem] bg-[#111] sm:rounded-[1.75rem] lg:rounded-[2rem]">
      <div
        className="absolute inset-0 scale-110"
        style={{ filter: `blur(${blur}px)` }}
      >
        <MediaImage
          mediaId={visual.backgroundMediaId}
          imageUrl={visual.backgroundImageUrl}
          alt=""
          fit="cover"
          objectPosition={visual.backgroundPosition ?? "50% 50%"}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: hexToRgba(overlayColor, overlay) }}
        aria-hidden
      />

      <div className="absolute inset-x-[9%] top-[5%] bottom-[0.4%] z-10 flex items-end justify-center gap-[6.5%]">
        <ScrollableMockup
          delay={0.1}
          className="h-full min-h-0 overflow-hidden rounded-[12px] shadow-[0_30px_70px_rgba(0,0,0,0.55)] sm:rounded-[16px]"
          style={{
            aspectRatio: WEB_DESIGN_FEATURED_FRAMES.desktop.aspect,
            transform: `translate(${visual.desktopPositionX}%, ${visual.desktopPositionY}%) scale(${desktopScale})`,
            transformOrigin: "center bottom",
          }}
        >
          <MediaImage
            mediaId={visual.desktopMediaId}
            imageUrl={visual.desktopImageUrl}
            alt="Desktop website"
            className="block h-auto w-full max-w-none"
          />
        </ScrollableMockup>

        <ScrollableMockup
          delay={0.2}
          className="min-h-0 overflow-hidden rounded-[12px] shadow-[0_24px_50px_rgba(0,0,0,0.55)] sm:rounded-[16px]"
          style={{
            aspectRatio: WEB_DESIGN_FEATURED_FRAMES.mobile.aspect,
            height: `${WEB_DESIGN_MOBILE_HEIGHT_REL * 100}%`,
            transform: `translate(${visual.mobilePositionX}%, ${visual.mobilePositionY}%) scale(${mobileScale})`,
            transformOrigin: "center bottom",
          }}
        >
          <MediaImage
            mediaId={visual.mobileMediaId}
            imageUrl={visual.mobileImageUrl}
            alt="Mobile website"
            className="block h-auto w-full max-w-none"
          />
        </ScrollableMockup>
      </div>
    </div>
  );
}
