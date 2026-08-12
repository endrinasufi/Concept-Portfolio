"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  const isSocial = Boolean(pathname?.startsWith("/social-media"));

  return (
    <footer
      className={`mt-auto border-t ${
        isSocial
          ? "border-black/10 bg-[#EAEAEA] text-neutral-900"
          : "border-border"
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-10 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <p className="font-display text-lg">Concept Marketing Albania</p>
          <p
            className={`mt-1 max-w-sm text-sm ${
              isSocial ? "text-neutral-500" : "text-muted"
            }`}
          >
            Branding, social media dhe drejtim artistik.
          </p>
        </div>
        <div
          className={`flex gap-6 text-sm ${
            isSocial ? "text-neutral-500" : "text-muted"
          }`}
        >
          <Link
            href="/branding"
            className={
              isSocial
                ? "transition hover:text-neutral-900"
                : "transition hover:text-foreground"
            }
          >
            Branding
          </Link>
          <Link
            href="/social-media"
            className={
              isSocial
                ? "transition hover:text-neutral-900"
                : "transition hover:text-foreground"
            }
          >
            Social Media
          </Link>
          <Link
            href="/admin"
            className={
              isSocial
                ? "transition hover:text-neutral-900"
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
