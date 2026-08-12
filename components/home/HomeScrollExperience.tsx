"use client";

import Link from "next/link";
import { ScrollArtCard } from "@/components/home/ScrollArtCard";
import { collectHomeCards } from "@/lib/home/collectHomeCards";
import {
  cardHeight,
  cardWidth,
  deckFan,
  deckPile,
  deckSpreadBR,
  deckStacked,
  isMobileHome,
  pileRiseDistance,
  portfolioRotation,
  stageOffset,
  stageSpreadOffset,
  type CardPose,
} from "@/lib/home/scrollCardLayout";
import { useProjects } from "@/lib/hooks/useProjects";
import { useSiteSettings } from "@/lib/hooks/useSiteSettings";
import { sortByOrder } from "@/lib/utils/id";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

function applyPose(el: HTMLElement, pose: CardPose, opacity = 1) {
  gsap.set(el, {
    x: pose.x,
    y: pose.y,
    rotation: pose.rotate,
    scale: pose.scale,
    zIndex: pose.zIndex,
    opacity,
    force3D: true,
  });
}

export function HomeScrollExperience() {
  const scrollSectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const cardStageRef = useRef<HTMLDivElement>(null);
  const heroHeadlineRef = useRef<HTMLDivElement>(null);
  const heroLine2Ref = useRef<HTMLHeadingElement>(null);
  const heroPortfolioRef = useRef<HTMLSpanElement>(null);
  const marketBlockRef = useRef<HTMLDivElement>(null);
  const marketLine1Ref = useRef<HTMLParagraphElement>(null);
  const marketLine2Ref = useRef<HTMLHeadingElement>(null);
  const marketLine3Ref = useRef<HTMLParagraphElement>(null);
  const marketSupportRef = useRef<HTMLDivElement>(null);
  const bridgeRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { projects, loading: projectsLoading } = useProjects({
    service: "branding",
  });
  const { settings, loading: settingsLoading } = useSiteSettings();
  const [vw, setVw] = useState<number | null>(null);

  const cards = useMemo(() => {
    if (vw === null) return [];
    return collectHomeCards(
      projects,
      sortByOrder(settings.clientLogos ?? []),
      vw,
    );
  }, [projects, settings.clientLogos, vw]);

  useLayoutEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useLayoutEffect(() => {
    if (projectsLoading || settingsLoading || !cards.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const section = scrollSectionRef.current;
      const pin = pinRef.current;
      const stage = cardStageRef.current;
      if (!section || !pin || !stage) return;

      const width = window.innerWidth;
      const total = cards.length;
      const pile = deckPile(total, width);
      const fan = deckFan(total, width);
      const stacked = deckStacked(total, width);
      const spread = deckSpreadBR(total, width);
      const mobile = isMobileHome(width);
      const portfolioTilt = portfolioRotation(width);

      const cardEls = cardRefs.current.filter(Boolean) as HTMLDivElement[];

      gsap.set(cardEls, { force3D: true });

      if (reduced) {
        cardEls.forEach((el, i) => {
          const f = fan[i];
          if (f) applyPose(el, f);
        });
        gsap.set(heroLine2Ref.current, { opacity: 1, y: 0, filter: "blur(0px)" });
        gsap.set(heroPortfolioRef.current, { opacity: 1, rotation: portfolioTilt });
        gsap.set(marketBlockRef.current, { opacity: 1 });
        return;
      }

      cardEls.forEach((el, i) => {
        const p = pile[i];
        if (p) applyPose(el, p, 0);
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

      gsap.set(heroLine2Ref.current, {
        opacity: 0,
        y: 15,
        filter: "blur(8px)",
      });
      const portfolioLetters = heroPortfolioRef.current?.querySelectorAll<HTMLElement>(
        ".portfolio-letter",
      );
      gsap.set(heroPortfolioRef.current, { opacity: 1, rotation: portfolioTilt });
      if (portfolioLetters?.length) {
        gsap.set(portfolioLetters, {
          opacity: 0,
          y: 10,
          scale: 0.94,
          filter: "blur(6px)",
        });
      }
      gsap.set(marketBlockRef.current, { opacity: 0 });
      gsap.set(marketLine1Ref.current, { opacity: 0.35, filter: "blur(10px)" });
      gsap.set(marketLine2Ref.current, { opacity: 0.2, y: 20, filter: "blur(12px)" });
      gsap.set(marketLine3Ref.current, { opacity: 0, filter: "blur(8px)" });
      gsap.set(marketSupportRef.current, { opacity: 0, y: 12 });

      // —— Intro autoplay: grumbull fade-up → hapje fan → CTA ——
      const introTl = gsap.timeline({
        defaults: { ease: "power2.out" },
        delay: 0.35,
        paused: true,
      });

      // Faza 1 — grumbulli ngjitet nga poshtë
      introTl.to(
        stage,
        {
          y: heroStage.y,
          opacity: 1,
          duration: 1.05,
          ease: "power3.out",
        },
        0,
      );

      introTl.to(
        cardEls,
        {
          opacity: 1,
          duration: 0.9,
          stagger: { each: 0.02, from: "center" },
          ease: "power2.out",
        },
        0.05,
      );

      introTl.to(
        heroLine2Ref.current,
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.85 },
        0.3,
      );

      if (portfolioLetters?.length) {
        introTl.to(
          portfolioLetters,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.75,
            ease: "power3.out",
          },
          0.42,
        );
      }

      // Grumbulli hapet në fan — një tween i qetë për kartë
      cardEls.forEach((el, i) => {
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
          0.95 + i * 0.05,
        );
      });

      // —— Scroll: fan → grumbull (i njëjti vend) → hapje poshtë-djathtas + tekst i ri ——
      const scrollTl = gsap.timeline({
        defaults: { ease: "power2.inOut", immediateRender: false },
        paused: true,
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: mobile ? 0.45 : 0.55,
          invalidateOnRefresh: true,
        },
      });

      scrollTl.scrollTrigger?.disable();
      scrollTl.set(cardEls, { opacity: 1 }, 0);

      // Faza 1 — kartat bashkohen njëra mbi tjetrën (fan → stack, pa lëvizur stage)
      cardEls.forEach((el, i) => {
        const s = stacked[i];
        if (!s) return;
        scrollTl.to(
          el,
          {
            x: s.x,
            y: s.y,
            rotation: s.rotate,
            scale: s.scale,
            zIndex: s.zIndex,
            opacity: 1,
            duration: 0.32,
            ease: "power2.inOut",
          },
          0 + i * 0.006,
        );
      });

      scrollTl.to(
        heroHeadlineRef.current,
        { opacity: 0, duration: 0.14, ease: "power2.in" },
        0.12,
      );

      // Teksti i ri (majtas)
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

      // Faza 2 — stage ngrihet te vija e Branding, pastaj hapje poshtë-djathtas
      scrollTl.to(
        stage,
        {
          y: spreadStage.y,
          duration: 0.32,
          ease: "power3.out",
        },
        0.32,
      );

      cardEls.forEach((el, i) => {
        const sp = spread[i];
        if (!sp) return;
        scrollTl.to(
          el,
          {
            x: sp.x,
            y: sp.y,
            rotation: sp.rotate,
            scale: sp.scale,
            zIndex: sp.zIndex,
            opacity: 1,
            duration: 0.38,
            ease: "power3.out",
          },
          0.36 + i * 0.012,
        );
      });

      introTl.eventCallback("onComplete", () => {
        cardEls.forEach((el, i) => {
          const f = fan[i];
          if (f) applyPose(el, f, 1);
        });
        gsap.set(stage, {
          x: heroStage.x,
          y: heroStage.y,
          opacity: 1,
          force3D: true,
        });
        scrollTl.progress(0, false);
        scrollTl.scrollTrigger?.enable();
        ScrollTrigger.refresh();
      });

      introTl.play();
    }, scrollSectionRef);

    return () => {
      ctx.revert();
    };
  }, [cards, projectsLoading, settingsLoading]);

  if (projectsLoading || settingsLoading || vw === null) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center text-muted">
        Duke ngarkuar…
      </div>
    );
  }

  if (!cards.length) {
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
      <span
        ref={heroPortfolioRef}
        className={`font-portfolio pointer-events-none absolute left-1/2 top-[52%] z-10 -translate-x-1/2 -translate-y-1/2 text-center normal-case leading-none text-[var(--portfolio-orange)] will-change-transform ${
          mobile
            ? "w-[24%] text-[5.6vw]"
            : "w-[26%] text-[8.5vw] sm:top-[54%] sm:w-[22%] sm:text-[7vw] md:w-[20%] md:text-[6vw]"
        }`}
        aria-hidden
      >
        {"Portfolio".split("").map((char, i) => (
          <span key={`${char}-${i}`} className="portfolio-letter inline-block">
            {char}
          </span>
        ))}
      </span>
    </h1>
  );

  return (
    <>
      <section
        ref={scrollSectionRef}
        className="relative z-0 h-[210vh] sm:h-[400vh] md:h-[450vh]"
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
          <div
            ref={heroHeadlineRef}
            className={
              mobile
                ? "pointer-events-none z-[1] shrink-0 px-3 pb-1 pt-0.5 text-center"
                : "pointer-events-none absolute left-1/2 top-[calc(var(--header-top)+var(--header-h)+0.25rem)] z-[1] w-screen -translate-x-1/2 px-3 sm:px-5 md:top-[calc(var(--header-top)+var(--header-h)+1rem)]"
            }
          >
            {heroHeadline}
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
                    ? "h-[min(48vw,200px)] max-w-[100vw]"
                    : "h-[min(112vw,768px)] max-w-[min(100vw,960px)] md:h-[784px]"
                }`}
              >
                {cards.map((card, i) => (
                  <ScrollArtCard
                    key={card.id}
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    card={card}
                    width={cardW}
                    height={cardH}
                  />
                ))}
              </div>
            </div>

            <div
              ref={marketBlockRef}
              className={
                mobile
                  ? "pointer-events-none absolute inset-x-3 top-[2%] z-30 mx-auto max-w-[17rem] text-center"
                  : "pointer-events-none absolute left-5 top-[22%] z-30 max-w-md px-5 md:left-8 md:top-[24%] lg:max-w-lg"
              }
            >
              <p
                ref={marketLine1Ref}
                className="text-[10px] uppercase tracking-[0.28em] text-accent sm:text-[11px] sm:tracking-[0.32em]"
              >
                Branding
              </p>
              <h2
                ref={marketLine2Ref}
                className="font-display mt-1.5 text-[1.2rem] leading-[1.1] tracking-tight sm:mt-3 sm:text-3xl md:text-5xl"
              >
                Shfaq, krijo dhe
                <br />
                <span className="text-foreground/55">zbuloni identitete.</span>
              </h2>
              <p
                ref={marketLine3Ref}
                className="mt-2 text-[11px] leading-relaxed text-muted sm:mt-4 sm:text-sm md:text-base"
              >
                Një komunitet dinamik ku kreativiteti dhe strategjia bashkohen —
                ArtFusion për markat shqiptare.
              </p>
              <div
                ref={marketSupportRef}
                className={`mt-3 flex flex-wrap gap-2 sm:mt-5 sm:gap-3 ${mobile ? "justify-center" : ""}`}
              >
                <span className="rounded-full bg-foreground px-4 py-1.5 text-[10px] font-medium text-background sm:px-5 sm:py-2 sm:text-xs">
                  Eksploro portfolio
                </span>
                <span className="rounded-full border border-border px-4 py-1.5 text-[10px] text-muted sm:px-5 sm:py-2 sm:text-xs">
                  Lexo më shumë
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bridge into rest of site */}
      <section
        ref={bridgeRef}
        className="relative border-t border-border bg-background px-5 py-16 md:px-8 md:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            Portfolio
          </p>
          <h2 className="font-display mt-3 max-w-3xl text-4xl leading-tight md:text-5xl">
            Vazhdoni të eksploroni projektet tona.
          </h2>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/branding"
              className="rounded-full bg-foreground px-7 py-3 text-sm font-medium text-background transition hover:bg-accent"
            >
              Të gjitha projektet
            </Link>
            <Link
              href="/admin"
              className="rounded-full border border-border px-7 py-3 text-sm text-muted transition hover:border-foreground/40 hover:text-foreground"
            >
              Admin
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
