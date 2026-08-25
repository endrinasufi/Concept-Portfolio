"use client";

import Link from "next/link";
import { useEffect } from "react";
import { FadeIn, Reveal } from "@/components/motion/Reveal";
import { useSiteSettings } from "@/lib/hooks/useSiteSettings";
import { isExternalHref, resolveFooterSettings } from "@/lib/layout/footer";
import type { SiteSettings } from "@/types/settings";

export function ContactPageClient({
  initialSettings,
}: {
  initialSettings?: SiteSettings;
}) {
  const { settings } = useSiteSettings({
    initial: initialSettings,
  });
  const footer = resolveFooterSettings(settings);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--project-bg", "#0E0F11");
    return () => {
      root.style.removeProperty("--project-bg");
    };
  }, []);

  const socials = footer.socialLinks.filter((item) => item.href);

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: "#0E0F11" }}>
      <div className="relative z-[1] mx-auto max-w-7xl px-5 pb-24 pt-[var(--header-offset)] md:px-8">
        <FadeIn>
          <div className="max-w-4xl border-b border-white/[0.08] pb-12 md:pb-16">
            <h1 className="font-page-title text-6xl md:text-7xl lg:text-8xl">
              Contact
            </h1>
          </div>
        </FadeIn>

        <div className="mt-12 grid max-w-4xl gap-12 md:mt-16 md:grid-cols-2 md:gap-16">
          <Reveal>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/40">
              Email
            </p>
            <a
              href={`mailto:${footer.email}`}
              className="mt-4 inline-block break-all text-2xl tracking-[-0.03em] transition-opacity duration-300 hover:opacity-70 md:text-3xl"
            >
              {footer.email}
            </a>
            <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.22em] text-white/40">
              Location
            </p>
            <p className="mt-4 text-lg text-white/80">{footer.location}</p>
          </Reveal>

          <Reveal delay={0.08}>
            {socials.length > 0 ? (
              <>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/40">
                  {footer.socialLabel}
                </p>
                <ul className="mt-4 flex flex-col items-start gap-3">
                  {socials.map((item) => (
                    <li key={item.id}>
                      <a
                        href={item.href}
                        {...(isExternalHref(item.href)
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="text-lg transition-opacity duration-300 hover:opacity-70"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <p className="mt-10 text-[11px] font-medium uppercase tracking-[0.22em] text-white/40">
              {footer.exploreLabel}
            </p>
            <ul className="mt-4 flex flex-col items-start gap-3">
              {footer.exploreLinks
                .filter((item) => item.href !== "/contact")
                .map((item) => (
                  <li key={item.id}>
                    {isExternalHref(item.href) ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg transition-opacity duration-300 hover:opacity-70"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.href || "/"}
                        className="text-lg transition-opacity duration-300 hover:opacity-70"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
