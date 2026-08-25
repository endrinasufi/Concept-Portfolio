"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["500"],
});

export type VideoPageView = "social" | "production";

const TABS: { id: VideoPageView; label: string; href: string }[] = [
  {
    id: "social",
    label: "Social Media",
    href: "/video-production/social",
  },
  {
    id: "production",
    label: "Production",
    href: "/video-production/production",
  },
];

export function VideoPageHeader({ active }: { active: VideoPageView }) {
  return (
    <div className="border-b border-white/[0.08] pb-12 md:pb-16">
      <h1 className="font-page-title text-6xl md:text-7xl lg:text-8xl">
        Video
      </h1>
      <div className="mt-8 md:mt-9">
        <LiquidVideoSwitcher active={active} />
      </div>
    </div>
  );
}

/** Switcher minimal me blob liquid që shtrihet kur lëviz. */
export function LiquidVideoSwitcher({ active }: { active: VideoPageView }) {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const left = useMotionValue(0);
  const width = useMotionValue(0);
  const [ready, setReady] = useState(false);

  // Stretch liquid: sa më shpejt lëviz, aq më shumë zgjatet
  const prevLeft = useRef(0);
  const stretch = useMotionValue(1);
  const blobWidth = useTransform(
    [width, stretch],
    ([w, s]) => (w as number) * (s as number),
  );
  const blobLeft = useTransform(
    [left, width, stretch],
    ([l, w, s]) =>
      (l as number) - (((w as number) * ((s as number) - 1)) / 2),
  );

  useLayoutEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      const idx = TABS.findIndex((t) => t.id === active);
      const el = itemRefs.current[idx];
      if (!track || !el) return;
      const t = track.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const nextLeft = r.left - t.left;
      const nextWidth = r.width;

      if (!ready || reduce) {
        left.set(nextLeft);
        width.set(nextWidth);
        stretch.set(1);
        setReady(true);
        prevLeft.current = nextLeft;
        return;
      }

      const distance = Math.abs(nextLeft - prevLeft.current);
      const bump = Math.min(1.45, 1 + distance / 140);

      stretch.set(bump);
      void animate(stretch, 1, {
        type: "spring",
        stiffness: 180,
        damping: 16,
        mass: 0.7,
      });
      void animate(left, nextLeft, {
        type: "spring",
        stiffness: 220,
        damping: 22,
        mass: 0.8,
      });
      void animate(width, nextWidth, {
        type: "spring",
        stiffness: 220,
        damping: 22,
        mass: 0.8,
      });
      prevLeft.current = nextLeft;
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [active, left, width, stretch, ready, reduce]);

  return (
    <div className={`relative inline-flex ${inter.className}`}>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <filter id="video-liquid-min">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div
        ref={trackRef}
        className="relative flex items-center rounded-full bg-white/[0.06] p-1"
        role="tablist"
        aria-label="Lloji i videos"
      >
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
          style={{ filter: reduce ? undefined : "url(#video-liquid-min)" }}
          aria-hidden
        >
          {ready ? (
            <motion.span
              className="absolute top-1 bottom-1 rounded-full bg-white"
              style={{ left: blobLeft, width: blobWidth }}
            />
          ) : null}
        </div>

        {TABS.map((tab, i) => {
          const isActive = tab.id === active;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              scroll={false}
              ref={(node) => {
                itemRefs.current[i] = node;
              }}
              role="tab"
              aria-selected={isActive}
              className={`relative z-10 rounded-full px-5 py-2 text-[13px] font-medium tracking-tight transition-colors duration-300 md:px-6 md:py-2.5 ${
                isActive ? "!text-black" : "text-white/45 hover:text-white/75"
              }`}
              style={isActive ? { color: "#000000" } : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
