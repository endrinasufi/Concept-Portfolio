"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMediaUrl } from "@/lib/hooks/useMediaUrl";
import { useSiteSettings } from "@/lib/hooks/useSiteSettings";
import { Inter } from "next/font/google";
import { Menu, X } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

const SITE = "https://conceptmarketing.al";

const navLinks = [
  { href: "/branding", label: "Branding" },
  { href: "/social-media", label: "Social Media" },
  { href: "/web-design", label: "Web Design" },
  { href: "/video-production", label: "Video" },
  { href: "/photoshooting", label: "Photoshooting" },
  { href: "/kontakt", label: "Contact" },
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
  const isLightPage = Boolean(pathname?.startsWith("/social-media/"));
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  if (isAdmin) return null;

  const stroke: CSSProperties = isLightPage
    ? {
        ...PILL_STROKE,
        borderColor: "rgba(0, 0, 0, 0.18)",
      }
    : PILL_STROKE;

  const linkTone = isLightPage ? "text-neutral-900" : "text-white";
  const activeTone = isLightPage ? "bg-black/5" : "bg-black/40";

  return (
    <header
      className={`pointer-events-none fixed inset-x-0 top-0 z-[9999] w-full ${inter.className}`}
      style={{ color: isLightPage ? "#171717" : "#ffffff" }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-52 transition-opacity duration-500"
        style={{
          opacity: scrolled ? 1 : 0,
          background: isLightPage
            ? "linear-gradient(to bottom, rgba(234,234,234,0.5) 0%, rgba(234,234,234,0.18) 45%, transparent 100%)"
            : "linear-gradient(to bottom, rgba(10,10,11,0.48) 0%, rgba(10,10,11,0.16) 45%, transparent 100%)",
          backdropFilter: "blur(7px) saturate(1.3)",
          WebkitBackdropFilter: "blur(7px) saturate(1.3)",
          maskImage:
            "linear-gradient(to bottom, #000 0%, #000 38%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, #000 0%, #000 38%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-52 transition-opacity duration-500"
        style={{
          opacity: scrolled ? 1 : 0,
          backdropFilter: "blur(7px)",
          WebkitBackdropFilter: "blur(7px)",
          maskImage: "linear-gradient(to bottom, #000 0%, transparent 38%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, #000 0%, transparent 38%)",
        }}
      />
      <div className="pointer-events-auto relative z-10 mx-auto box-border flex w-full max-w-7xl items-center justify-between px-5 pt-[var(--header-top)] pb-3 md:px-8">
        <div
          className="box-border flex w-max shrink-0 grow-0 items-center"
          style={{
            ...stroke,
            height: PILL_HEIGHT,
            paddingLeft: 17.5,
            paddingRight: 17.5,
            lineHeight: 0,
            background: isLightPage ? "rgba(255,255,255,0.72)" : "transparent",
          }}
        >
          <Link
            href="/"
            style={{ display: "inline-block", lineHeight: 0 }}
            aria-label="Concept Marketing Albania"
          >
            <SiteLogoImg dark={isLightPage} />
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
              background: isLightPage ? "rgba(255,255,255,0.72)" : "transparent",
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
                  style={{ color: "inherit" }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="ml-auto flex shrink-0 items-center justify-end gap-3 md:gap-4">
          <a
            href={SITE}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center rounded-full px-5 py-[7px] text-[14px] font-medium transition md:inline-flex"
            style={
              isLightPage
                ? { background: "#171717", color: "#ffffff" }
                : { background: "#ffffff", color: "#171717" }
            }
          >
            <span>Visit Website</span>
            <span className="ml-[5px] inline-block">
              <PortfolioArrow />
            </span>
          </a>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center md:hidden"
            style={{
              ...stroke,
              background: isLightPage ? "rgba(255,255,255,0.72)" : "transparent",
            }}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={18} strokeWidth={1.8} /> : <Menu size={18} strokeWidth={1.8} />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div
          id="mobile-nav"
          className="pointer-events-auto fixed inset-0 z-[1] flex flex-col md:hidden"
          style={{
            background: isLightPage
              ? "linear-gradient(180deg, #F3F1ED 0%, #EAEAEA 100%)"
              : "linear-gradient(180deg, #121214 0%, #0a0a0b 100%)",
            color: isLightPage ? "#171717" : "#f2efe8",
            paddingTop: "calc(var(--header-top) + var(--header-h) + 1.25rem)",
          }}
        >
          <nav
            className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-6"
            aria-label="Mobile"
          >
            {navLinks.map((link, i) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between gap-4 py-3.5"
                  style={{
                    color: "inherit",
                    borderBottom: isLightPage
                      ? "0.5px solid rgba(0,0,0,0.1)"
                      : "0.5px solid rgba(255,255,255,0.1)",
                    opacity: active ? 1 : 0.55,
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  <span
                    className="text-[22px] font-light tracking-[-0.02em]"
                    style={{ fontWeight: active ? 500 : 300 }}
                  >
                    {link.label}
                  </span>
                  <span
                    className="text-[11px] tabular-nums tracking-[0.16em]"
                    style={{
                      opacity: 0.45,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div
            className="px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5"
            style={{
              borderTop: isLightPage
                ? "0.5px solid rgba(0,0,0,0.1)"
                : "0.5px solid rgba(255,255,255,0.1)",
            }}
          >
            <a
              href={SITE}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center rounded-full px-5 py-3.5 text-[14px] font-medium"
              style={
                isLightPage
                  ? {
                      background: "#171717",
                      color: "#ffffff",
                      boxShadow: "0 10px 28px rgba(23,23,23,0.18)",
                    }
                  : {
                      background: "#ffffff",
                      color: "#171717",
                      boxShadow: "0 10px 28px rgba(0,0,0,0.28)",
                    }
              }
              onClick={() => setMenuOpen(false)}
            >
              <span>Visit Website</span>
              <span className="ml-[5px] inline-block">
                <PortfolioArrow />
              </span>
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function SiteLogoImg({ dark }: { dark?: boolean }) {
  const { settings, loading } = useSiteSettings();
  const lightSrc = useMediaUrl(settings.logoMediaId);
  const darkSrc = useMediaUrl(settings.logoDarkMediaId);
  const uploaded = dark ? darkSrc || lightSrc : lightSrc;
  const src = !loading && uploaded ? uploaded : "/brand/logo-light.svg";
  const invertFallback = Boolean(dark && !loading && !darkSrc);

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
        filter: invertFallback ? "invert(1)" : undefined,
      }}
    />
  );
}
