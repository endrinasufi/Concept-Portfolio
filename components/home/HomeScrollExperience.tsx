"use client";

import Link from "next/link";
import { ScrollArtCard } from "@/components/home/ScrollArtCard";
import { ClientLogosBand } from "@/components/home/ClientLogosBand";
import { SITE_CATEGORIES } from "@/lib/data/categories";
import { collectCategoryCards } from "@/lib/home/collectHomeCards";
import {
  cardHeight,
  cardWidth,
  deckFan,
  deckMobileExit,
  deckMobileStack,
  deckPile,
  deckSpreadBR,
  deckStacked,
  deckTextFan,
  deckTextStack,
  deckWave,
  homeEarlyCardCount,
  isMobileHome,
  pileRiseDistance,
  stageOffset,
  stageSpreadOffset,
  wrapHeadlineToTop,
  type CardPose,
} from "@/lib/home/scrollCardLayout";
import { useProjects } from "@/lib/hooks/useProjects";
import { useSocialMediaProjects } from "@/lib/hooks/useSocialMediaProjects";
import { useVideoProduction } from "@/lib/hooks/useVideoProduction";
import { useWebDesignProjects } from "@/lib/hooks/useWebDesignProjects";
import { useSiteSettings } from "@/lib/hooks/useSiteSettings";
import { sortByOrder } from "@/lib/utils/id";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

function applyPose(el: HTMLElement, pose: CardPose, visible = 1) {
  gsap.set(el, {
    x: pose.x,
    y: pose.y,
    rotation: pose.rotate,
    scale: pose.scale,
    zIndex: pose.zIndex,
    autoAlpha: visible,
    force3D: true,
  });
}

function lockHomeScroll() {
  const html = document.documentElement;
  const body = document.body;
  const prev = {
    htmlOverflow: html.style.overflow,
    bodyOverflow: body.style.overflow,
    htmlOverscroll: html.style.overscrollBehavior,
    bodyOverscroll: body.style.overscrollBehavior,
  };

  html.style.overflow = "hidden";
  body.style.overflow = "hidden";
  html.style.overscrollBehavior = "none";
  body.style.overscrollBehavior = "none";
  window.scrollTo(0, 0);

  const block = (event: Event) => {
    event.preventDefault();
  };
  const blockKeys = (event: KeyboardEvent) => {
    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp" ||
      event.key === "PageDown" ||
      event.key === "PageUp" ||
      event.key === " " ||
      event.key === "Home" ||
      event.key === "End"
    ) {
      event.preventDefault();
    }
  };

  window.addEventListener("wheel", block, { passive: false, capture: true });
  window.addEventListener("touchmove", block, { passive: false, capture: true });
  window.addEventListener("keydown", blockKeys, { capture: true });

  return () => {
    html.style.overflow = prev.htmlOverflow;
    body.style.overflow = prev.bodyOverflow;
    html.style.overscrollBehavior = prev.htmlOverscroll;
    body.style.overscrollBehavior = prev.bodyOverscroll;
    window.removeEventListener("wheel", block, { capture: true });
    window.removeEventListener("touchmove", block, { capture: true });
    window.removeEventListener("keydown", blockKeys, { capture: true });
  };
}

import type { Project } from "@/types/branding";
import type { SocialMediaProject } from "@/types/social-media";
import type { VideoProductionItem } from "@/types/video-production";
import type { WebDesignProject } from "@/types/web-design";
import type { SiteSettings } from "@/types/settings";

type HomeScrollExperienceProps = {
  initialBrandingProjects?: Project[];
  initialSocialProjects?: SocialMediaProject[];
  initialVideoItems?: VideoProductionItem[];
  initialWebDesignProjects?: WebDesignProject[];
  initialSettings?: SiteSettings;
};

export function HomeScrollExperience({
  initialBrandingProjects,
  initialSocialProjects,
  initialVideoItems,
  initialWebDesignProjects,
  initialSettings,
}: HomeScrollExperienceProps = {}) {
  const scrollSectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const cardStageRef = useRef<HTMLDivElement>(null);
  const heroHeadlineRef = useRef<HTMLDivElement>(null);
  const heroLine2Ref = useRef<HTMLHeadingElement>(null);
  const marketBlockRef = useRef<HTMLDivElement>(null);
  const marketLine1Ref = useRef<HTMLParagraphElement>(null);
  const marketLine2Ref = useRef<HTMLHeadingElement>(null);
  const marketLine3Ref = useRef<HTMLParagraphElement>(null);
  const marketSupportRef = useRef<HTMLDivElement>(null);
  const wrapHeadlineRef = useRef<HTMLDivElement>(null);
  const wrapTextRef = useRef<HTMLParagraphElement>(null);
  const textCardRef = useRef<HTMLDivElement>(null);
  const bridgeRef = useRef<HTMLDivElement>(null);
  const brandingRefs = useRef<(HTMLDivElement | null)[]>([]);
  const socialRefs = useRef<(HTMLDivElement | null)[]>([]);
  const webRefs = useRef<(HTMLDivElement | null)[]>([]);

  const hasServerData = initialBrandingProjects !== undefined;

  const hookBranding = useProjects({
    service: "branding",
    enabled: !hasServerData,
    initial: initialBrandingProjects,
  });
  const hookSocial = useSocialMediaProjects({
    enabled: !hasServerData,
    initial: initialSocialProjects,
  });
  const hookVideo = useVideoProduction({
    enabled: !hasServerData,
    initial: initialVideoItems,
  });
  const hookWeb = useWebDesignProjects({
    enabled: !hasServerData,
    initial: initialWebDesignProjects,
  });
  const hookSettings = useSiteSettings({
    enabled: !hasServerData,
    initial: initialSettings,
  });

  const brandingProjects = hasServerData
    ? (initialBrandingProjects ?? [])
    : hookBranding.projects;
  const socialProjects = hasServerData
    ? (initialSocialProjects ?? [])
    : hookSocial.projects;
  const videoItems = hasServerData
    ? (initialVideoItems ?? [])
    : hookVideo.videos;
  const webDesignProjects = hasServerData
    ? (initialWebDesignProjects ?? [])
    : hookWeb.projects;
  const settings = hasServerData
    ? (initialSettings as SiteSettings)
    : hookSettings.settings;

  const brandingLoading = hasServerData ? false : hookBranding.loading;
  const socialLoading = hasServerData ? false : hookSocial.loading;
  const videoLoading = hasServerData ? false : hookVideo.loading;
  const webDesignLoading = hasServerData ? false : hookWeb.loading;
  const settingsLoading = hasServerData ? false : hookSettings.loading;
  const [vw, setVw] = useState<number | null>(null);

  const brandingCards = useMemo(() => {
    if (vw === null) return [];
    return collectCategoryCards({
      category: SITE_CATEGORIES[0],
      brandingProjects,
      socialProjects,
      videoItems,
      webDesignProjects,
      clientLogos: sortByOrder(settings.clientLogos ?? []),
      viewportWidth: vw,
      homeFeatured: settings.homeFeatured,
    });
  }, [
    brandingProjects,
    socialProjects,
    videoItems,
    webDesignProjects,
    settings.clientLogos,
    settings.homeFeatured,
    vw,
  ]);

  const socialCards = useMemo(() => {
    if (vw === null) return [];
    return collectCategoryCards({
      category: SITE_CATEGORIES[1],
      brandingProjects,
      socialProjects,
      videoItems,
      webDesignProjects,
      clientLogos: sortByOrder(settings.clientLogos ?? []),
      viewportWidth: vw,
      homeFeatured: settings.homeFeatured,
    });
  }, [
    brandingProjects,
    socialProjects,
    videoItems,
    webDesignProjects,
    settings.clientLogos,
    settings.homeFeatured,
    vw,
  ]);

  const webCards = useMemo(() => {
    if (vw === null) return [];
    return collectCategoryCards({
      category: SITE_CATEGORIES[2],
      brandingProjects,
      socialProjects,
      videoItems,
      webDesignProjects,
      clientLogos: sortByOrder(settings.clientLogos ?? []),
      viewportWidth: vw,
      homeFeatured: settings.homeFeatured,
    });
  }, [
    brandingProjects,
    socialProjects,
    videoItems,
    webDesignProjects,
    settings.clientLogos,
    settings.homeFeatured,
    vw,
  ]);

  useLayoutEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useLayoutEffect(() => {
    if (
      brandingLoading ||
      socialLoading ||
      videoLoading ||
      webDesignLoading ||
      settingsLoading ||
      !brandingCards.length
    )
      return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.registerPlugin(ScrollTrigger);

    let unlockScroll: (() => void) | undefined;

    const ctx = gsap.context(() => {
      const section = scrollSectionRef.current;
      const pin = pinRef.current;
      const stage = cardStageRef.current;
      if (!section || !pin || !stage) return;

      const width = window.innerWidth;
      const total = brandingCards.length;
      const early = Math.min(homeEarlyCardCount(width), total);
      const pile = deckPile(early, width);
      const fan = deckFan(early, width);
      const stacked = deckStacked(early, width);
      const spread = deckSpreadBR(early, width);
      const cluster = deckTextStack(early, width);
      const textFan = deckTextFan(early, width);
      const mobile = isMobileHome(width);
      const wrapH = wrapTextRef.current?.getBoundingClientRect().height ?? 120;
      const grid = deckWave(total, width, pin.clientHeight, wrapH);
      const wrapTopY = wrapHeadlineToTop(width, pin.clientHeight, wrapH);

      const brandingEls = brandingRefs.current.filter(Boolean) as HTMLDivElement[];
      const socialEls = socialRefs.current.filter(Boolean) as HTMLDivElement[];
      const webEls = webRefs.current.filter(Boolean) as HTMLDivElement[];
      const allEls = [...brandingEls, ...socialEls, ...webEls];

      gsap.set(allEls, { force3D: true });

      if (reduced) {
        gsap.set(heroLine2Ref.current, { opacity: 0 });
        gsap.set(marketBlockRef.current, { opacity: 0 });
        gsap.set(wrapHeadlineRef.current, { opacity: 1, y: wrapTopY, filter: "blur(0px)" });
        gsap.set(stage, { x: 0, y: 0 });
        if (mobile) {
          const brandingStack = deckMobileStack(total, width, "branding");
          const socialStack = deckMobileStack(total, width, "social");
          const webStack = deckMobileStack(total, width, "web");
          gsap.set(wrapHeadlineRef.current, { opacity: 0 });
          brandingEls.forEach((el, i) => {
            const pose = brandingStack[i];
            if (pose) applyPose(el, pose, 1);
          });
          socialEls.forEach((el, i) => {
            const pose = socialStack[i];
            if (pose) applyPose(el, pose, 0);
          });
          webEls.forEach((el, i) => {
            const pose = webStack[i];
            if (pose) applyPose(el, pose, 0);
          });
        } else {
          brandingEls.forEach((el, i) => {
            const pose = fan[i];
            if (pose) applyPose(el, pose, 0);
          });
          socialEls.forEach((el, i) => {
            const pose = stacked[i];
            if (pose) applyPose(el, pose, 0);
          });
          webEls.forEach((el, i) => {
            const pose = grid[i];
            if (pose) applyPose(el, { ...pose, scale: 1.26 }, 1);
          });
        }
        if (textCardRef.current) {
          gsap.set(textCardRef.current, { autoAlpha: 0, pointerEvents: "none" });
        }
        return;
      }

      unlockScroll = lockHomeScroll();

      brandingEls.forEach((el, i) => {
        applyPose(el, pile[Math.min(i, early - 1)] ?? pile[0], 0);
      });
      socialEls.forEach((el, i) => {
        applyPose(el, pile[Math.min(i, early - 1)] ?? pile[0], 0);
      });
      webEls.forEach((el, i) => {
        applyPose(el, pile[Math.min(i, early - 1)] ?? pile[0], 0);
      });

      const heroStage = stageOffset("hero", width);
      const headlineH =
        mobile && heroHeadlineRef.current
          ? heroHeadlineRef.current.getBoundingClientRect().height
          : 0;
      const spreadStage = stageSpreadOffset(
        width,
        pin.clientHeight,
        spread[0]?.y ?? 0,
        headlineH,
      );
      const riseFrom = pileRiseDistance(width);

      gsap.set(stage, {
        x: heroStage.x,
        y: heroStage.y + riseFrom,
        opacity: 0,
        force3D: true,
      });

      // Pin ekranin gjatë scroll-it — kartat mbeten në vend
      // zIndex i ulët: header (z-9999) mbetet gjithmonë sipër
      gsap.set(pin, { zIndex: 0 });
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        pin: pin,
        pinSpacing: true,
        pinType: "fixed",
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      if (mobile) {
        const brandingStack = deckMobileStack(total, width, "branding");
        const socialStack = deckMobileStack(total, width, "social");
        const webStack = deckMobileStack(total, width, "web");
        const step = 0.34;
        const hold = 0.22;

        gsap.set(heroHeadlineRef.current, { autoAlpha: 0 });
        gsap.set(marketBlockRef.current, { autoAlpha: 0 });
        gsap.set(wrapHeadlineRef.current, { autoAlpha: 0 });
        if (textCardRef.current) {
          gsap.set(textCardRef.current, { autoAlpha: 0, pointerEvents: "none" });
        }

        function cardTitle(el: HTMLElement) {
          return el.querySelector<HTMLElement>(".card-inline-title");
        }

        function setActiveTitle(els: HTMLDivElement[], activeIndex: number) {
          els.forEach((el, i) => {
            const title = cardTitle(el);
            if (!title) return;
            gsap.set(title, { opacity: i === activeIndex ? 1 : 0 });
          });
        }

        brandingEls.forEach((el, i) =>
          applyPose(el, brandingStack[i] ?? brandingStack[0], 0),
        );
        socialEls.forEach((el, i) =>
          applyPose(el, socialStack[i] ?? socialStack[0], 0),
        );
        webEls.forEach((el, i) => applyPose(el, webStack[i] ?? webStack[0], 0));
        setActiveTitle(brandingEls, -1);
        setActiveTitle(socialEls, -1);
        setActiveTitle(webEls, -1);

        gsap.set(stage, { x: 0, y: 28, opacity: 0, force3D: true });

        const introTl = gsap.timeline({
          defaults: { ease: "power2.out" },
          delay: 0.45,
          paused: true,
        });

        introTl.to(
          stage,
          { y: 0, opacity: 1, duration: 0.85, ease: "power3.out" },
          0,
        );
        brandingEls.forEach((el, i) => {
          const p = brandingStack[i] ?? brandingStack[0];
          introTl.to(
            el,
            {
              autoAlpha: 1,
              x: p.x,
              y: p.y,
              rotation: p.rotate,
              scale: p.scale,
              zIndex: p.zIndex,
              duration: 0.7,
              ease: "power3.out",
            },
            0.12 + i * 0.07,
          );
        });
        const brandingFirstTitle = brandingEls[0]
          ? cardTitle(brandingEls[0])
          : null;
        if (brandingFirstTitle) {
          introTl.to(brandingFirstTitle, { opacity: 1, duration: 0.35 }, 0.55);
        }

        const scrollTl = gsap.timeline({
          defaults: { ease: "power2.inOut", immediateRender: false },
          paused: true,
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.55,
            invalidateOnRefresh: true,
          },
        });
        scrollTl.scrollTrigger?.disable();

        function sequenceDeck(
          els: HTMLDivElement[],
          stack: CardPose[],
          style: "branding" | "social" | "web",
          start: number,
          enter: "set" | "fadeUp" | "fadeSide" = "set",
        ): number {
          const enterDur =
            enter === "set" ? 0 : style === "web" ? step * 1.05 : step * 0.9;
          const holdStart = start + enterDur;
          const exitEase =
            style === "social"
              ? "power2.in"
              : style === "web"
                ? "power3.in"
                : "power3.in";
          const exitDur =
            style === "social" ? step * 0.9 : style === "web" ? step * 0.88 : step * 0.82;

          els.forEach((el, i) => {
            const p = stack[i] ?? stack[0];
            const title = cardTitle(el);

            if (enter === "fadeUp") {
              scrollTl.set(
                el,
                {
                  x: p.x,
                  y: p.y + 64,
                  rotation: p.rotate,
                  scale: p.scale * 0.94,
                  zIndex: p.zIndex,
                  autoAlpha: 0,
                },
                start,
              );
              if (title) scrollTl.set(title, { opacity: 0 }, start);
              scrollTl.to(
                el,
                {
                  y: p.y,
                  scale: p.scale,
                  autoAlpha: 1,
                  duration: enterDur,
                  ease: "power3.out",
                },
                start + i * 0.035,
              );
              if (title && i === 0) {
                scrollTl.to(
                  title,
                  { opacity: 1, duration: enterDur * 0.55, ease: "power2.out" },
                  start + enterDur * 0.4,
                );
              }
            } else if (enter === "fadeSide") {
              scrollTl.set(
                el,
                {
                  x: p.x + width * 0.55,
                  y: p.y + 20,
                  rotation: p.rotate + 8,
                  scale: p.scale * 0.9,
                  zIndex: p.zIndex,
                  autoAlpha: 0,
                },
                start,
              );
              if (title) scrollTl.set(title, { opacity: 0 }, start);
              scrollTl.to(
                el,
                {
                  x: p.x,
                  y: p.y,
                  rotation: p.rotate,
                  scale: p.scale,
                  autoAlpha: 1,
                  duration: enterDur,
                  ease: "power3.out",
                },
                start + i * 0.04,
              );
              if (title && i === 0) {
                scrollTl.to(
                  title,
                  { opacity: 1, duration: enterDur * 0.5, ease: "power2.out" },
                  start + enterDur * 0.45,
                );
              }
            } else {
              scrollTl.set(
                el,
                {
                  x: p.x,
                  y: p.y,
                  rotation: p.rotate,
                  scale: p.scale,
                  zIndex: p.zIndex,
                  autoAlpha: 1,
                },
                start,
              );
              if (title) scrollTl.set(title, { opacity: i === 0 ? 1 : 0 }, start);
            }
          });

          for (let k = 0; k < els.length; k++) {
            const t = holdStart + hold + k * step;
            const from = stack[k] ?? stack[0];
            const exit = deckMobileExit(k, width, from, style);
            const leavingTitle = cardTitle(els[k]);
            const nextTitle =
              k + 1 < els.length ? cardTitle(els[k + 1]) : null;

            // Mbaje sipër gjatë daljes — mos e ço pas kartës tjetër
            scrollTl.set(els[k], { zIndex: 80 + (els.length - k) }, t);

            if (leavingTitle) {
              scrollTl.to(
                leavingTitle,
                { opacity: 0, duration: step * 0.25, ease: "power2.in" },
                t,
              );
            }
            if (nextTitle) {
              scrollTl.to(
                nextTitle,
                { opacity: 1, duration: step * 0.35, ease: "power2.out" },
                t + step * 0.15,
              );
            }

            // Ul opacitetin fillimisht, pastaj vazhdo daljen (pa restack)
            scrollTl.to(
              els[k],
              {
                autoAlpha: 0.35,
                duration: step * 0.28,
                ease: "power2.in",
              },
              t,
            );
            scrollTl.to(
              els[k],
              {
                x: exit.x,
                y: exit.y,
                rotation: exit.rotate,
                scale: exit.scale,
                autoAlpha: 0,
                duration: exitDur,
                ease: exitEase,
              },
              t + step * 0.22,
            );
          }

          return holdStart + hold + els.length * step;
        }

        scrollTl.set(socialEls, { autoAlpha: 0 }, 0);
        scrollTl.set(webEls, { autoAlpha: 0 }, 0);

        const handoffLead = step * 0.75;

        let t = 0.02;
        const brandingEnd = sequenceDeck(
          brandingEls,
          brandingStack,
          "branding",
          t,
          "set",
        );
        t = brandingEnd - handoffLead;
        const socialEnd = sequenceDeck(
          socialEls,
          socialStack,
          "social",
          t,
          "fadeUp",
        );
        t = socialEnd - handoffLead;
        sequenceDeck(webEls, webStack, "web", t, "fadeSide");

        introTl.eventCallback("onComplete", () => {
          brandingEls.forEach((el, i) => {
            applyPose(el, brandingStack[i] ?? brandingStack[0], 1);
          });
          socialEls.forEach((el, i) => {
            applyPose(el, socialStack[i] ?? socialStack[0], 0);
          });
          webEls.forEach((el, i) => {
            applyPose(el, webStack[i] ?? webStack[0], 0);
          });
          setActiveTitle(brandingEls, 0);
          setActiveTitle(socialEls, -1);
          setActiveTitle(webEls, -1);
          gsap.set(stage, { x: 0, y: 0, opacity: 1, force3D: true });
          window.scrollTo(0, 0);
          unlockScroll?.();
          unlockScroll = undefined;
          scrollTl.progress(0, false);
          scrollTl.scrollTrigger?.enable();
          ScrollTrigger.refresh();
        });

        introTl.play();
        return;
      }

      gsap.set(heroLine2Ref.current, {
        opacity: 0,
        y: 15,
        filter: "blur(8px)",
      });
      gsap.set(marketBlockRef.current, { opacity: 0 });
      gsap.set(marketLine1Ref.current, { opacity: 0.35, filter: "blur(10px)" });
      gsap.set(marketLine2Ref.current, { opacity: 0.2, y: 20, filter: "blur(12px)" });
      gsap.set(marketLine3Ref.current, { opacity: 0, filter: "blur(8px)" });
      gsap.set(marketSupportRef.current, { opacity: 0, y: 12 });
      gsap.set(wrapHeadlineRef.current, { opacity: 0, y: 18, filter: "blur(10px)" });
      if (textCardRef.current) {
        applyPose(textCardRef.current, cluster[0], 0);
      }

      // —— Intro autoplay: grumbull fade-up → hapje fan → CTA ——
      const introTl = gsap.timeline({
        defaults: { ease: "power2.out" },
        delay: 0.7,
        paused: true,
      });

      introTl.to(
        heroLine2Ref.current,
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.85 },
        0,
      );

      introTl.to(
        stage,
        {
          y: heroStage.y,
          opacity: 1,
          duration: 1.05,
          ease: "power3.out",
        },
        0.55,
      );

      introTl.to(
        brandingEls.slice(0, early),
        {
          autoAlpha: 1,
          duration: 0.9,
          stagger: { each: 0.02, from: "center" },
          ease: "power2.out",
        },
        0.6,
      );

      brandingEls.forEach((el, i) => {
        const f = fan[i];
        if (!f) return;
        introTl.to(
          el,
          {
            x: f.x,
            y: f.y,
            rotation: f.rotate,
            scale: f.scale,
            zIndex: f.zIndex,
            duration: 1.2,
            ease: "power3.out",
          },
          1.45 + i * 0.05,
        );
      });

      const scrollTl = gsap.timeline({
        defaults: { ease: "power2.inOut", immediateRender: false },
        paused: true,
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: mobile ? 0.4 : 0.48,
          invalidateOnRefresh: true,
        },
      });

      const poseGroups = [brandingEls, socialEls, webEls];
      const webScale = mobile ? 1.18 : 1.26;
      function scaledPose(group: HTMLDivElement[], p: CardPose): CardPose {
        if (group !== webEls) return p;
        return { ...p, scale: webScale };
      }
      function tweenPoses(
        poses: CardPose[],
        start: number,
        duration: number,
        stagger: number,
        ease = "power3.inOut",
      ) {
        for (const group of poseGroups) {
          group.forEach((el, i) => {
            const p = poses[i];
            if (!p) return;
            const pose = scaledPose(group, p);
            scrollTl.to(
              el,
              {
                x: pose.x,
                y: pose.y,
                rotation: pose.rotate,
                scale: pose.scale,
                zIndex: pose.zIndex,
                duration,
                ease,
              },
              start + i * stagger,
            );
          });
        }
      }

      scrollTl.scrollTrigger?.disable();
      scrollTl.set(brandingEls.slice(0, early), { autoAlpha: 1 }, 0);
      scrollTl.set(brandingEls.slice(early), { autoAlpha: 0 }, 0);
      scrollTl.set([...socialEls, ...webEls], { autoAlpha: 0 }, 0);

      tweenPoses(stacked, 0, 0.32, 0.006, "power2.inOut");

      scrollTl.to(
        heroHeadlineRef.current,
        { opacity: 0, duration: 0.14, ease: "power2.in" },
        0.12,
      );

      scrollTl.to(
        brandingEls,
        { autoAlpha: 0, y: "-=28", duration: 0.2, ease: "power2.in" },
        0.26,
      );
      socialEls.slice(0, early).forEach((el, i) => {
        const p = stacked[i];
        if (!p || !el) return;
        scrollTl.fromTo(
          el,
          {
            autoAlpha: 0,
            x: p.x,
            y: p.y + 42,
            rotation: p.rotate,
            scale: p.scale * 0.96,
            zIndex: p.zIndex,
          },
          {
            autoAlpha: 1,
            y: p.y,
            scale: p.scale,
            duration: 0.22,
            ease: "power3.out",
          },
          0.26 + i * 0.012,
        );
      });

      scrollTl.to(marketBlockRef.current, { opacity: 1, duration: 0.1 }, 0.28);
      scrollTl.to(
        marketLine1Ref.current,
        { opacity: 1, filter: "blur(0px)", duration: 0.1, ease: "power2.out" },
        0.3,
      );
      scrollTl.to(
        marketLine2Ref.current,
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.14,
          ease: "power3.out",
        },
        0.34,
      );
      scrollTl.to(
        marketLine3Ref.current,
        { opacity: 1, filter: "blur(0px)", duration: 0.1, ease: "power2.out" },
        0.42,
      );
      scrollTl.to(
        marketSupportRef.current,
        { opacity: 1, y: 0, duration: 0.1, ease: "power2.out" },
        0.46,
      );

      scrollTl.to(
        stage,
        {
          y: spreadStage.y,
          duration: 0.32,
          ease: "power3.out",
        },
        0.32,
      );

      tweenPoses(spread, 0.36, 0.38, 0.012, "power3.out");
      scrollTl.to(
        socialEls.slice(early),
        { autoAlpha: 1, duration: 0.2, ease: "power2.out" },
        0.42,
      );

      scrollTl.to(
        marketBlockRef.current,
        { opacity: 0, duration: 0.16, ease: "power2.in" },
        0.82,
      );
      scrollTl.to(
        stage,
        { y: 0, x: 0, duration: 0.36, ease: "power3.inOut" },
        0.84,
      );
      tweenPoses(cluster, 0.84, 0.4, 0.008, "power3.inOut");
      scrollTl.to(
        wrapHeadlineRef.current,
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.28,
          ease: "power2.out",
        },
        0.88,
      );

      scrollTl.to(
        socialEls,
        { autoAlpha: 0, y: "-=24", duration: 0.2, ease: "power2.in" },
        1.06,
      );
      webEls.forEach((el, i) => {
        const p = cluster[i] ?? cluster[0];
        if (!p || !el) return;
        scrollTl.fromTo(
          el,
          {
            autoAlpha: 0,
            x: p.x,
            y: p.y + 48,
            rotation: p.rotate,
            scale: 1.26 * 0.94,
            zIndex: p.zIndex,
          },
          {
            autoAlpha: 1,
            y: p.y,
            scale: 1.26,
            duration: 0.24,
            ease: "power3.out",
          },
          1.06 + i * 0.014,
        );
      });

      tweenPoses(textFan, 1.18, 0.42, 0.012, "power3.inOut");

      scrollTl.to(
        wrapHeadlineRef.current,
        { y: wrapTopY, opacity: 1, duration: 0.36, ease: "power3.inOut" },
        1.72,
      );
      scrollTl.to(
        stage,
        { x: 0, y: 0, duration: 0.36, ease: "power3.inOut" },
        1.74,
      );
      tweenPoses(grid, 1.76, 0.48, 0.02, "power3.inOut");
      if (textCardRef.current) {
        scrollTl.to(
          textCardRef.current,
          { autoAlpha: 0, duration: 0.16, ease: "power2.in" },
          1.72,
        );
      }

      introTl.eventCallback("onComplete", () => {
        brandingEls.forEach((el, i) => {
          const f = fan[i];
          if (f) applyPose(el, f, 1);
          else applyPose(el, pile[0], 0);
        });
        socialEls.forEach((el, i) => {
          applyPose(el, pile[Math.min(i, early - 1)] ?? pile[0], 0);
        });
        webEls.forEach((el, i) => {
          applyPose(el, pile[Math.min(i, early - 1)] ?? pile[0], 0);
        });
        gsap.set(stage, {
          x: heroStage.x,
          y: heroStage.y,
          opacity: 1,
          force3D: true,
        });
        window.scrollTo(0, 0);
        unlockScroll?.();
        unlockScroll = undefined;
        scrollTl.progress(0, false);
        scrollTl.scrollTrigger?.enable();
        ScrollTrigger.refresh();
      });

      introTl.play();
    }, scrollSectionRef);

    return () => {
      unlockScroll?.();
      ctx.revert();
    };
  }, [
    brandingCards,
    socialCards,
    webCards,
    brandingLoading,
    socialLoading,
    videoLoading,
    webDesignLoading,
    settingsLoading,
  ]);

  if (
    brandingLoading ||
    socialLoading ||
    videoLoading ||
    webDesignLoading ||
    settingsLoading ||
    vw === null
  ) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center text-muted">
        Duke ngarkuar…
      </div>
    );
  }

  if (!brandingCards.length) {
    return (
      <div className="flex min-h-[100svh] flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="text-muted">Shto projekte branding për të shfaqur kartat.</p>
        <Link href="/admin" className="text-accent hover:underline">
          Hap admin →
        </Link>
      </div>
    );
  }

  const cardW = cardWidth(vw);
  const cardH = cardHeight(vw);
  const mobile = isMobileHome(vw);
  const brandingH = mobile ? cardW : cardH;

  const heroHeadline = (
    <h1
      ref={heroLine2Ref}
      className={`relative font-hero-caps whitespace-nowrap text-center uppercase leading-none ${
        mobile
          ? "text-[11.5vw] tracking-[-0.02em]"
          : "text-[22vw] tracking-[-0.02em] md:text-[28vw] md:tracking-[-0.01em]"
      }`}
    >
      BOLD CONCEPT
    </h1>
  );

  return (
    <>
      <section
        ref={scrollSectionRef}
        className="relative z-0 h-[560vh] sm:h-[480vh] md:h-[560vh]"
        aria-label="Hero scroll animation"
      >
        <div
          ref={pinRef}
          className={`relative z-0 h-[100svh] w-full overflow-hidden ${
            mobile
              ? "flex flex-col pt-[var(--header-offset-compact)]"
              : "pt-[var(--header-offset)]"
          }`}
        >
          {!mobile ? (
            <div
              ref={heroHeadlineRef}
              className="pointer-events-none absolute left-1/2 top-[calc(var(--header-top)+var(--header-h)+0.25rem)] z-[1] w-screen -translate-x-1/2 px-3 sm:px-5 md:top-[calc(var(--header-top)+var(--header-h)+1rem)]"
            >
              {heroHeadline}
            </div>
          ) : null}

          <div
            ref={wrapHeadlineRef}
            className={
              mobile
                ? "pointer-events-none absolute inset-x-4 top-[var(--header-offset-compact)] z-[2] hidden"
                : "pointer-events-none absolute inset-0 z-[2] flex items-center justify-center px-5 md:px-10"
            }
          >
            <p
              ref={wrapTextRef}
              className={`max-w-5xl text-center font-sans font-semibold leading-[1.22] tracking-tight ${
                mobile
                  ? "text-[1.28rem]"
                  : "text-[1.7rem] sm:text-4xl md:text-[2.65rem] lg:text-[3.05rem]"
              }`}
            >
              Qoftë një film që kërkon ritëm
              <br />
              ose një markë që kërkon histori{" "}
              <span className="text-[#7dccb3]">unik</span>
              <br />
              <span className="text-[0.62em] font-medium text-foreground/40">
                në video — imazh që lëviz.
              </span>
            </p>
          </div>

          <div
            className={
              mobile
                ? "relative min-h-0 w-full flex-1 px-3"
                : "relative mx-auto h-full w-full max-w-7xl px-3 md:px-8"
            }
          >
            <div
              className={
                mobile
                  ? "pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-visible"
                  : "pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-visible pt-[5vh] md:pt-[6vh]"
              }
            >
              <div
                ref={cardStageRef}
                className={`pointer-events-auto relative w-full overflow-visible will-change-transform ${
                  mobile
                    ? "h-full max-w-[100vw]"
                    : "h-[min(112vw,768px)] max-w-[min(100vw,960px)] md:h-[784px]"
                }`}
              >
                {brandingCards.map((card, i) => (
                  <ScrollArtCard
                    key={card.id}
                    ref={(el) => {
                      brandingRefs.current[i] = el;
                    }}
                    card={card}
                    width={cardW}
                    height={brandingH}
                    showInlineTitle={mobile}
                  />
                ))}
                {socialCards.map((card, i) => (
                  <ScrollArtCard
                    key={card.id}
                    ref={(el) => {
                      socialRefs.current[i] = el;
                    }}
                    card={card}
                    width={cardW}
                    height={cardH}
                    showInlineTitle={mobile}
                  />
                ))}
                {webCards.map((card, i) => (
                  <ScrollArtCard
                    key={card.id}
                    ref={(el) => {
                      webRefs.current[i] = el;
                    }}
                    card={card}
                    width={cardW}
                    height={cardH}
                    largeTag
                    showInlineTitle={mobile}
                  />
                ))}
                <div
                  ref={textCardRef}
                  className={`pointer-events-none absolute left-1/2 top-1/2 flex flex-col justify-between rounded-[1.25rem] bg-[#f2efe8] p-4 text-[#0a0a0b] shadow-[0_18px_50px_rgba(0,0,0,0.45)] will-change-transform md:rounded-[1.5rem] md:p-6 ${mobile ? "hidden" : ""}`}
                  style={{
                    width: cardW,
                    height: cardH,
                    marginLeft: -cardW / 2,
                    marginTop: -cardH / 2,
                  }}
                >
                  <div className="flex justify-end">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0a0a0b] text-[#f2efe8]"
                      aria-hidden
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M5 12h14M13 6l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-[1.05rem] leading-[1.12] tracking-tight md:text-[1.45rem]">
                      Ku arti takon tregun
                    </h3>
                    <p className="mt-2 text-[10px] leading-relaxed text-black/55 md:text-[13px]">
                      Identitete vizuale dhe drejtim artistik për markat që duan
                      të dallohet.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              ref={marketBlockRef}
              className={
                mobile
                  ? "pointer-events-none absolute inset-x-3 top-[2%] z-30 hidden"
                  : "pointer-events-none absolute left-5 top-[22%] z-30 max-w-md px-5 md:left-8 md:top-[24%] lg:max-w-lg"
              }
            >
              <p
                ref={marketLine1Ref}
                className="text-[10px] uppercase tracking-[0.28em] text-accent sm:text-[11px] sm:tracking-[0.32em]"
              >
                Social Media
              </p>
              <h2
                ref={marketLine2Ref}
                className="font-page-title mt-1.5 text-[1.2rem] sm:mt-3 sm:text-3xl md:text-5xl"
              >
                Shfaq, krijo dhe
                <br />
                <span className="text-foreground/55">ndani historitë.</span>
              </h2>
              <p
                ref={marketLine3Ref}
                className="mt-2 text-[11px] leading-relaxed text-muted sm:mt-4 sm:text-sm md:text-base"
              >
                Përmbajtje dhe strategji që rritin markën në rrjete — për
                komunitete që duan të dëgjohen.
              </p>
              <div
                ref={marketSupportRef}
                className={`mt-3 flex flex-wrap gap-2 sm:mt-5 sm:gap-3 ${mobile ? "justify-center" : ""}`}
              >
                <span className="rounded-full bg-foreground px-4 py-1.5 text-[10px] font-medium text-background sm:px-5 sm:py-2 sm:text-xs">
                  Eksploro projektet
                </span>
                <span className="rounded-full border border-border px-4 py-1.5 text-[10px] text-muted sm:px-5 sm:py-2 sm:text-xs">
                  Lexo më shumë
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ClientLogosBand logos={sortByOrder(settings.clientLogos ?? [])} />

      {/* Bridge into rest of site */}
      <section
        ref={bridgeRef}
        className="relative border-t border-border bg-background px-5 py-16 md:px-8 md:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <h2 className="font-page-title max-w-3xl text-4xl md:text-5xl">
            Vazhdoni të eksploroni projektet tona.
          </h2>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/branding"
              className="rounded-full bg-foreground px-7 py-3 text-sm font-medium text-background transition hover:bg-accent"
            >
              Branding
            </Link>
            <Link
              href="/social-media"
              className="rounded-full border border-border px-7 py-3 text-sm text-muted transition hover:border-foreground/40 hover:text-foreground"
            >
              Social Media
            </Link>
            <Link
              href="/web-design"
              className="rounded-full border border-border px-7 py-3 text-sm text-muted transition hover:border-foreground/40 hover:text-foreground"
            >
              Web Design
            </Link>
            <Link
              href="/video-production"
              className="rounded-full border border-border px-7 py-3 text-sm text-muted transition hover:border-foreground/40 hover:text-foreground"
            >
              Video Production
            </Link>
            <Link
              href="/photoshooting"
              className="rounded-full border border-border px-7 py-3 text-sm text-muted transition hover:border-foreground/40 hover:text-foreground"
            >
              Photoshooting
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
