"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-border mt-auto">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-10 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <p className="font-display text-lg">Concept Marketing Albania</p>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Branding, identitet vizual dhe drejtim artistik.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-muted">
          <Link href="/branding" className="hover:text-foreground transition">
            Branding
          </Link>
          <Link href="/admin" className="hover:text-foreground transition">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
