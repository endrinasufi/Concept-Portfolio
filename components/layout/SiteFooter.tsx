"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState, type AnchorHTMLAttributes, type ReactNode } from "react";
import { useSiteSettings } from "@/lib/hooks/useSiteSettings";
import {
  isExternalHref,
  parseCssColor,
  relativeLuminance,
  resolveFooterSettings,
} from "@/lib/layout/footer";

const EASE = [0.22, 1, 0.36, 1] as const;

function useFooterOnLight(pathname: string | null) {
  const [onLight, setOnLight] = useState(() =>
    Boolean(pathname?.match(/^\/social-media\/[^/]+/)),
  );

  useEffect(() => {
    function read() {
      const bg = getComputedStyle(document.documentElement)
        .getPropertyValue("--project-bg")
        .trim();
      const rgb = parseCssColor(bg);
      if (rgb) {
        setOnLight(relativeLuminance(rgb) > 0.42);
        return;
      }
      setOnLight(Boolean(pathname?.match(/^\/social-media\/[^/]+/)));
    }

    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });
    return () => observer.disconnect();
  }, [pathname]);

  return onLight;
}

function FooterHref({
  href,
  className,
  children,
  ...rest
}: {
  href: string;
  className?: string;
  children: ReactNode;
} & AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (isExternalHref(href)) {
    const newTab = href.startsWith("http");
    return (
      <a
        href={href}
        className={className}
        {...(newTab
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  );
}

function FooterTextLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  return (
    <FooterHref
      href={href}
      className="group/flink inline-flex max-w-full items-center gap-1.5 text-[15px] leading-snug tracking-[-0.01em] transition-opacity duration-300 hover:opacity-100 md:text-base"
    >
      <span className="relative inline-block transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/flink:translate-x-1">
        {children}
        <span
          aria-hidden
          className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-current transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/flink:scale-x-100"
        />
      </span>
      {external ? (
        <span
          aria-hidden
          className="translate-y-px text-[0.7em] opacity-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/flink:translate-x-0.5 group-hover/flink:-translate-y-0.5 group-hover/flink:opacity-70"
        >
          ↗
        </span>
      ) : null}
    </FooterHref>
  );
}

function FooterCta({ href, title }: { href: string; title: string }) {
  const lines = title.split(/\n/).map((line) => line.trim()).filter(Boolean);
  const last = lines.at(-1) ?? title;
  const rest = lines.slice(0, -1);

  return (
    <FooterHref
      href={href}
      className="group/cta relative block w-full min-w-0 pb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/40"
      aria-label={`${title.replace(/\s+/g, " ")} — Contact`}
    >
      <span className="font-page-title flex flex-col gap-[0.12em] text-[clamp(2.75rem,8.2vw+1.2rem,7.5rem)] leading-[0.88] tracking-[-0.02em] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:-translate-y-1 group-hover/cta:opacity-85">
        {rest.map((line, index) => (
          <span key={`${index}-${line}`} className="block">
            {line}
          </span>
        ))}
        <span className="flex items-end justify-between gap-3 sm:gap-6">
          <span className="min-w-0">{last}</span>
          <span
            aria-hidden
            className="mb-[0.04em] shrink-0 font-sans text-[clamp(2rem,5vw,4.75rem)] leading-none transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:translate-x-2 group-hover/cta:-translate-y-2"
          >
            ↗
          </span>
        </span>
      </span>
      <span
        aria-hidden
        className="mt-4 block h-px origin-left scale-x-0 bg-current/70 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:scale-x-100 md:mt-6"
      />
    </FooterHref>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { settings } = useSiteSettings();
  const footer = resolveFooterSettings(settings);
  const onLight = useFooterOnLight(pathname);
  const year = useMemo(() => new Date().getFullYear(), []);

  if (pathname?.startsWith("/admin")) return null;
  if (pathname === "/kontakt" || pathname === "/contact") return null;

  const socials = footer.socialLinks;

  return (
    <footer
      className={`relative z-0 mt-auto overflow-x-hidden bg-transparent ${
        onLight ? "text-neutral-900" : "text-[var(--foreground)]"
      }`}
    >
      <div className="mx-auto w-full max-w-7xl px-5 pt-16 pb-8 md:px-8 md:pt-24 md:pb-10 lg:pt-28">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <FooterCta href={footer.ctaUrl} title={footer.ctaTitle} />
        </motion.div>

        <div className="mt-14 md:mt-20 lg:mt-24">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-12 lg:grid-cols-4 lg:gap-12">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{
                duration: 0.55,
                ease: EASE,
                delay: reduce ? 0 : 0.12,
              }}
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] opacity-45">
                {footer.contactLabel}
              </p>
              <a
                href={`mailto:${footer.email}`}
                className="group/mail mt-4 inline-block max-w-full break-all text-[15px] tracking-[-0.02em] transition-opacity duration-300 hover:opacity-70 md:text-base"
              >
                <span className="relative">
                  {footer.email}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-current transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/mail:scale-x-100"
                  />
                </span>
              </a>
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{
                duration: 0.55,
                ease: EASE,
                delay: reduce ? 0 : 0.18,
              }}
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] opacity-45">
                {footer.locationLabel}
              </p>
              <p className="mt-4 text-[15px] md:text-base">{footer.location}</p>
            </motion.div>

            {socials.length > 0 ? (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{
                duration: 0.55,
                ease: EASE,
                delay: reduce ? 0 : 0.24,
              }}
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] opacity-45">
                {footer.socialLabel}
              </p>
              <ul className="mt-4 flex flex-col items-start gap-2.5">
                {socials.map((item) => (
                  <li key={item.id}>
                    {item.href ? (
                      <FooterTextLink href={item.href} external={isExternalHref(item.href)}>
                        {item.label}
                      </FooterTextLink>
                    ) : (
                      <span className="text-[15px] opacity-50 md:text-base">
                        {item.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
            ) : null}

            {footer.exploreLinks.length > 0 ? (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{
                duration: 0.55,
                ease: EASE,
                delay: reduce ? 0 : 0.3,
              }}
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] opacity-45">
                {footer.exploreLabel}
              </p>
              <ul className="mt-4 flex flex-col items-start gap-2.5">
                {footer.exploreLinks.map((item) => (
                  <li key={item.id}>
                    <FooterTextLink
                      href={item.href || "/"}
                      external={isExternalHref(item.href)}
                    >
                      {item.label}
                    </FooterTextLink>
                  </li>
                ))}
              </ul>
            </motion.div>
            ) : null}
          </div>
        </div>

        <motion.div
          className={`mt-16 h-px origin-left md:mt-20 ${
            onLight ? "bg-black/15" : "bg-white/12"
          }`}
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-6% 0px" }}
          transition={{ duration: 0.85, ease: EASE, delay: reduce ? 0 : 0.12 }}
        />

        <div className="flex items-center justify-between gap-6 pt-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em]">
            {footer.brandName}
          </p>
          <p className="text-[11px] uppercase tracking-[0.18em] opacity-55">
            © {year}
          </p>
        </div>
      </div>
    </footer>
  );
}
