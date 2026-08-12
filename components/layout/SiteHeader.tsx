"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMediaUrl } from "@/lib/hooks/useMediaUrl";
import { useSiteSettings } from "@/lib/hooks/useSiteSettings";
import { Inter } from "next/font/google";
import type { CSSProperties } from "react";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

const SITE = "https://conceptmarketing.al";

const navLinks = [
  { href: "/", label: "Kreu" },
  { href: "/branding", label: "Branding" },
  { href: "/social-media", label: "Social Media" },
  { href: "/admin", label: "Admin" },
] as const;

const PILL_STROKE: CSSProperties = {
  borderStyle: "solid",
  borderWidth: 0.5,
  borderColor: "rgba(255, 255, 255, 0.25)",
  borderRadius: 30,
  boxSizing: "border-box",
};

const PILL_HEIGHT = 44;

function isActive(pathname: string | null, href: string) {
  if (href === "/") return pathname === "/";
  return Boolean(pathname?.startsWith(href));
}

function PortfolioArrow() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M21 3V16.4751H19.5083V5.53591L4.0442 21L3 19.9061L18.4144 4.49171H7.47514V3H21Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isSocial = Boolean(pathname?.startsWith("/social-media"));

  if (isAdmin) return null;

  const stroke: CSSProperties = isSocial
    ? {
        ...PILL_STROKE,
        borderColor: "rgba(0, 0, 0, 0.18)",
      }
    : PILL_STROKE;

  const linkTone = isSocial ? "text-neutral-900" : "text-white";
  const activeTone = isSocial ? "bg-black/5" : "bg-black/40";

  return (
    <header
      className={`pointer-events-none fixed inset-x-0 top-0 z-[9999] w-full bg-transparent ${inter.className}`}
    >
      <div className="pointer-events-auto mx-auto box-border flex w-full max-w-7xl items-center justify-between px-5 pt-[var(--header-top)] pb-3 md:px-8">
        <div
          className="box-border flex w-max shrink-0 grow-0 items-center"
          style={{
            ...stroke,
            height: PILL_HEIGHT,
            paddingLeft: 17.5,
            paddingRight: 17.5,
            lineHeight: 0,
            background: isSocial ? "rgba(255,255,255,0.72)" : "transparent",
          }}
        >
          <Link
            href="/"
            style={{ display: "inline-block", lineHeight: 0 }}
            aria-label="Concept Marketing Albania"
          >
            <SiteLogoImg dark={isSocial} />
          </Link>
        </div>

        <div className="hidden min-w-0 flex-1 items-stretch md:flex">
          <nav
            className="ml-[15px] inline-flex items-center"
            style={{
              ...stroke,
              height: PILL_HEIGHT,
              paddingLeft: 7.5,
              paddingRight: 7.5,
              background: isSocial ? "rgba(255,255,255,0.72)" : "transparent",
            }}
            aria-label="Main"
          >
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-[30px] bg-transparent px-5 py-[5px] text-[14px] font-normal leading-7 tracking-[0] ${linkTone} ${
                    active ? activeTone : ""
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="ml-auto flex shrink-0 items-center justify-end gap-3 md:gap-4">
          <a
            href={`${SITE}/sq/`}
            className={`inline-flex items-center gap-1.5 text-[14px] font-normal ${linkTone}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/flag-sq.svg"
              alt=""
              width={18}
              height={18}
              className="h-[18px] w-[18px] rounded-full object-cover"
            />
            <span>SQ</span>
          </a>

          <a
            href={SITE}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center rounded-full px-5 py-[7px] text-[14px] font-medium transition ${
              isSocial
                ? "bg-neutral-900 text-white hover:bg-neutral-800"
                : "bg-white text-black hover:bg-white/90"
            }`}
          >
            <span>Visit Website</span>
            <span className="ml-[5px] inline-block">
              <PortfolioArrow />
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}

function SiteLogoImg({ dark }: { dark?: boolean }) {
  const { settings, loading } = useSiteSettings();
  const uploaded = useMediaUrl(settings.logoMediaId);
  const src = !loading && uploaded ? uploaded : "/brand/logo-light.svg";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Logo"
      width={239}
      height={20}
      decoding="async"
      loading="eager"
      className="logo1"
      style={{
        display: "block",
        height: 20,
        width: "auto",
        maxWidth: "none",
        border: 0,
        filter: dark && !uploaded ? "invert(1)" : undefined,
      }}
    />
  );
}
