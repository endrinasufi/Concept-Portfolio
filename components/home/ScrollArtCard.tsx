"use client";

import Link from "next/link";
import { MediaImage } from "@/components/branding/MediaImage";
import type { HomeCard } from "@/lib/home/collectHomeCards";
import gsap from "gsap";
import { useReducedMotion } from "motion/react";
import { forwardRef, useCallback, useRef } from "react";

const HOVER_Z = 1000;

type Props = {
  card: HomeCard;
  width: number;
  height: number;
  interactive?: boolean;
};

export const ScrollArtCard = forwardRef<HTMLDivElement, Props>(
  function ScrollArtCard(
    { card, width, height, interactive = false },
    ref,
  ) {
    const reduceMotion = useReducedMotion();
    const outerRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const floatTween = useRef<gsap.core.Tween | null>(null);
    const savedZ = useRef<number>(0);

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
      const outer = outerRef.current;
      if (!inner || !outer) return;

      savedZ.current = Number(gsap.getProperty(outer, "zIndex") ?? 0);
      gsap.to(outer, { zIndex: HOVER_Z, duration: 0.28, ease: "power2.out" });

      if (reduceMotion) {
        gsap.to(inner, { scale: 1.03, duration: 0.28, ease: "power2.out" });
        return;
      }

      floatTween.current?.kill();
      floatTween.current = null;

      gsap.to(inner, {
        scale: 1.045,
        y: -12,
        duration: 0.38,
        ease: "power3.out",
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
      const outer = outerRef.current;
      if (!inner || !outer) return;

      floatTween.current?.kill();
      floatTween.current = null;

      gsap.to(outer, {
        zIndex: savedZ.current,
        duration: 0.28,
        ease: "power2.out",
      });
      gsap.to(inner, {
        y: 0,
        scale: 1,
        duration: 0.42,
        ease: "power2.out",
      });
    }, []);

    const face = (
      <div
        className="relative h-full w-full overflow-hidden rounded-[1.25rem] bg-surface shadow-[0_18px_50px_rgba(0,0,0,0.45)] ring-1 ring-white/10 transition-[box-shadow,ring-color] duration-300 group-hover/card:shadow-[0_28px_72px_rgba(0,0,0,0.58)] group-hover/card:ring-white/25 md:rounded-[1.5rem]"
        style={{ width, height }}
      >
        <MediaImage
          mediaId={card.mediaId}
          imageUrl={card.imageUrl}
          alt=""
          fit="cover"
          className="h-full w-full"
        />
      </div>
    );

    return (
      <div
        ref={setOuterRef}
        className="group/card absolute left-1/2 top-1/2 cursor-pointer will-change-transform"
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
        <div ref={innerRef} className="h-full w-full will-change-transform">
          {interactive && card.href ? (
            <Link href={card.href} className="block h-full w-full">
              {face}
            </Link>
          ) : (
            face
          )}
        </div>
      </div>
    );
  },
);
