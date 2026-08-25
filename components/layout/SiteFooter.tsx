"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  if (pathname === "/kontakt") return null;

  const isSocialProject = Boolean(
    pathname?.startsWith("/social-media/"),
  );
  const isSocialList = pathname === "/social-media";
  const isWeb = Boolean(pathname?.startsWith("/web-design"));
  const isDarkList = isSocialList || isWeb;

  return (
    <footer
      className={`mt-auto border-t ${
        isSocialProject
          ? "border-black/10 bg-[#EAEAEA] text-neutral-900"
          : isDarkList
            ? "border-white/10 bg-[#0B0B0C] text-white"
            : "border-border"
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-10 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <p className="font-display text-lg">Concept Marketing Albania</p>
          <p
            className={`mt-1 max-w-sm text-sm ${
              isSocialProject
                ? "text-neutral-500"
                : isDarkList
                  ? "text-white/45"
                  : "text-muted"
            }`}
          >
            Branding, social media, web design, and art direction.
          </p>
        </div>
        <div
          className={`flex flex-wrap gap-6 text-sm ${
            isSocialProject
              ? "text-neutral-500"
              : isDarkList
                ? "text-white/45"
                : "text-muted"
          }`}
        >
          <Link
            href="/branding"
            className={
              isSocialProject
                ? "transition hover:text-neutral-900"
                : isDarkList
                  ? "transition hover:text-white"
                  : "transition hover:text-foreground"
            }
          >
            Branding
          </Link>
          <Link
            href="/social-media"
            className={
              isSocialProject
                ? "transition hover:text-neutral-900"
                : isDarkList
                  ? "transition hover:text-white"
                  : "transition hover:text-foreground"
            }
          >
            Social Media
          </Link>
          <Link
            href="/web-design"
            className={
              isSocialProject
                ? "transition hover:text-neutral-900"
                : isDarkList
                  ? "transition hover:text-white"
                  : "transition hover:text-foreground"
            }
          >
            Web Design
          </Link>
          <Link
            href="/photoshooting"
            className={
              isSocialProject
                ? "transition hover:text-neutral-900"
                : isDarkList
                  ? "transition hover:text-white"
                  : "transition hover:text-foreground"
            }
          >
            Photoshooting
          </Link>
          <Link
            href="/kontakt"
            className={
              isSocialProject
                ? "transition hover:text-neutral-900"
                : isDarkList
                  ? "transition hover:text-white"
                  : "transition hover:text-foreground"
            }
          >
            Contact
          </Link>
          <Link
            href="/admin"
            className={
              isSocialProject
                ? "transition hover:text-neutral-900"
                : isDarkList
                  ? "transition hover:text-white"
                  : "transition hover:text-foreground"
            }
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
