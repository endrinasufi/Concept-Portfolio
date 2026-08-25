"use client";

import Link from "next/link";
import { MediaImage } from "@/components/branding/MediaImage";
import type { HomeCard } from "@/lib/home/collectHomeCards";
import gsap from "gsap";
import { ArrowDownRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { forwardRef, useCallback, useRef, useState } from "react";

const TAG_FALLBACK = "#f19a2a";

function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.trim().replace("#", "");
  if (h.length === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    };
  }
  if (h.length === 6 && /^[0-9a-fA-F]+$/.test(h)) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }
  return null;
}

function luminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 0.5;
  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
}

function chroma(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 0;
  return Math.max(rgb.r, rgb.g, rgb.b) - Math.min(rgb.r, rgb.g, rgb.b);
}

function pickTagColor(colors: string[] | undefined, seed: number): string {
  const parsed = (colors ?? []).map((c) => c.trim()).filter(Boolean);
  const vivid = parsed.filter((c) => {
    const l = luminance(c);
    return l > 0.14 && l < 0.9 && chroma(c) > 22;
  });
  const mid = parsed.filter((c) => {
    const l = luminance(c);
    return l > 0.14 && l < 0.9;
  });
  const pool = vivid.length ? vivid : mid.length ? mid : parsed;
  if (!pool.length) return TAG_FALLBACK;
  return pool[seed % pool.length] ?? TAG_FALLBACK;
}

type Props = {
  card: HomeCard;
  width: number;
  height: number;
  interactive?: boolean;
  largeTag?: boolean;
  /** Celular: titulli brenda kartës (nuk ka hover për tag) */
  showInlineTitle?: boolean;
};

export const ScrollArtCard = forwardRef<HTMLDivElement, Props>(
  function ScrollArtCard(
    { card, width, height, interactive = true, largeTag = false, showInlineTitle = false },
    ref,
  ) {
    const reduceMotion = useReducedMotion();
    const outerRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const floatTween = useRef<gsap.core.Tween | null>(null);
    const [hovered, setHovered] = useState(false);

    const setOuterRef = useCallback(
      (node: HTMLDivElement | null) => {
        outerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const handleEnter = useCallback(() => {
      if (window.matchMedia("(hover: none)").matches) return;

      const inner = innerRef.current;
      if (!inner) return;

      setHovered(true);

      if (reduceMotion) {
        gsap.to(inner, { scale: 1.03, duration: 0.28, ease: "power2.out", overwrite: true });
        return;
      }

      floatTween.current?.kill();
      floatTween.current = null;

      gsap.to(inner, {
        scale: 1.045,
        y: -12,
        duration: 0.38,
        ease: "power3.out",
        overwrite: true,
        onComplete: () => {
          floatTween.current = gsap.to(inner, {
            y: "-=5",
            duration: 2.2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        },
      });
    }, [reduceMotion]);

    const handleLeave = useCallback(() => {
      const inner = innerRef.current;
      if (!inner) return;

      setHovered(false);
      floatTween.current?.kill();
      floatTween.current = null;
      gsap.killTweensOf(inner);
      gsap.to(inner, {
        y: 0,
        scale: 1,
        duration: 0.32,
        ease: "power2.out",
        overwrite: true,
      });
    }, []);

    const isService = card.kind === "service";
    const clientLabel = card.client?.replace(/^@/, "").trim();
    const tagSeed = hashId(card.id);
    const tagBg = pickTagColor(card.tagColors, tagSeed);
    const tagFg = luminance(tagBg) > 0.55 ? "#0a0a0b" : "#ffffff";
    const tagRotate = (tagSeed % 35) - 17;
    const tagLeft = 6 + (tagSeed % 42);
    const tagTail = largeTag
      ? 16 + ((tagSeed >> 5) % 28)
      : 12 + ((tagSeed >> 5) % 22);
    const tagLift = largeTag ? 16 : 12;

    const clientTag =
      !isService && clientLabel && !showInlineTitle ? (
      <span
        className="pointer-events-none absolute top-0 z-20 origin-bottom-left opacity-0 transition duration-300 ease-out group-hover/card:opacity-100"
        style={{
          left: tagLeft,
          transform: `translateY(calc(-100% - ${tagLift}px)) rotate(${tagRotate}deg)`,
        }}
        aria-hidden
      >
        <span
          className={
            largeTag
              ? "relative inline-flex items-center rounded-full px-5 py-2 md:px-6 md:py-2.5"
              : "relative inline-flex items-center rounded-full px-3.5 py-1.5 md:px-4 md:py-1.5"
          }
          style={{ backgroundColor: tagBg }}
        >
          <span
            className={
              largeTag
                ? "max-w-[16rem] truncate text-[15px] font-medium leading-none md:text-[17px]"
                : "max-w-[11rem] truncate text-[12px] font-medium leading-none md:text-[13px]"
            }
            style={{ color: tagFg }}
          >
            @{clientLabel}
          </span>
          <span
            className={
              largeTag
                ? "absolute top-[calc(100%-1px)] h-0 w-0 border-x-[8px] border-t-[9px] border-x-transparent"
                : "absolute top-[calc(100%-1px)] h-0 w-0 border-x-[6px] border-t-[7px] border-x-transparent"
            }
            style={{ left: tagTail, borderTopColor: tagBg }}
          />
        </span>
      </span>
    ) : null;

    const face = isService ? (
      <div
        className="relative flex h-full w-full flex-col justify-end overflow-hidden rounded-[1.6rem] bg-[#f2efe8] p-4 text-[#0a0a0b] md:rounded-[2rem] md:p-6"
        style={{ width, height }}
      >
        <h3 className="font-hero-caps text-[clamp(3.2rem,18vw,6.4rem)] uppercase leading-[0.82] tracking-[-0.03em] md:text-[8.2rem]">
          {card.title}
        </h3>
        <span className="mt-2.5 inline-flex items-center gap-2 text-[15px] font-medium md:mt-4 md:text-lg">
          {card.ctaLabel ?? "View all"}
          <ArrowDownRight size={20} strokeWidth={2} className="md:h-6 md:w-6" />
        </span>
      </div>
    ) : (
      <div
        className="relative h-full w-full overflow-hidden rounded-[1.6rem] bg-surface md:rounded-[2rem]"
        style={{ width, height }}
      >
        <MediaImage
          mediaId={card.mediaId}
          imageUrl={card.imageUrl}
          alt={card.title ?? ""}
          fit="cover"
          className="pointer-events-none h-full w-full"
        />
        {showInlineTitle && (card.title || clientLabel) ? (
          <div className="card-inline-title pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-3.5 pb-3.5 pt-10 opacity-0">
            <p className="text-[18px] font-medium leading-tight text-white">
              {card.title ?? clientLabel}
            </p>
          </div>
        ) : null}
      </div>
    );

    const wrapped =
      interactive && card.href ? (
        <Link
          href={card.href}
          className="relative z-[1] block h-full w-full"
          aria-label={card.title ?? card.ctaLabel ?? "Open project"}
        >
          {face}
        </Link>
      ) : (
        face
      );

    return (
      <div
        ref={setOuterRef}
        className={`group/card absolute left-1/2 top-1/2 cursor-pointer overflow-visible will-change-transform${hovered ? " scroll-card-hover" : ""}`}
        style={{
          width,
          height,
          marginLeft: -width / 2,
          marginTop: -height / 2,
          transformOrigin: "50% 50%",
        }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <div
          ref={innerRef}
          className="relative h-full w-full overflow-visible rounded-[1.6rem] shadow-[0_8px_22px_rgba(0,0,0,0.38),0_2px_6px_rgba(0,0,0,0.22)] will-change-transform transition-[box-shadow] duration-300 group-hover/card:shadow-[0_12px_28px_rgba(0,0,0,0.44),0_3px_8px_rgba(0,0,0,0.24)] md:rounded-[2rem]"
        >
          {wrapped}
          {clientTag}
        </div>
      </div>
    );
  },
);
