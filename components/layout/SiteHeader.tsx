"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMediaUrl } from "@/lib/hooks/useMediaUrl";
import { useSiteSettings } from "@/lib/hooks/useSiteSettings";

const links = [
  { href: "/", label: "Kreu" },
  { href: "/branding", label: "Branding" },
];

function SiteLogo() {
  const { settings, loading } = useSiteSettings();
  const logoUrl = useMediaUrl(settings.logoMediaId);

  return (
    <Link
      href="/"
      className="group flex min-h-10 min-w-[11rem] items-center md:min-w-[14rem]"
      aria-label="Concept Marketing Albania"
    >
      {!loading && logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt="Concept Marketing Albania"
          className="h-9 w-auto max-w-[14rem] object-contain object-left opacity-95 transition group-hover:opacity-100 md:h-10 md:max-w-[18rem]"
        />
      ) : (
        <span className="flex h-9 w-[14rem] items-center justify-center rounded-lg border border-dashed border-white/20 bg-white/[0.03] px-2 text-[10px] uppercase tracking-[0.22em] text-muted/80 md:h-10 md:w-[18rem]">
          Logo
        </span>
      )}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0a0a0b]/65 backdrop-blur-xl">
      <div className="mx-auto flex h-[var(--header-h)] max-w-7xl items-center justify-between gap-6 px-5 md:px-8">
        <SiteLogo />

        <nav className="flex items-center gap-1 text-[11px] uppercase tracking-[0.22em] text-muted md:gap-2">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-2 transition hover:text-foreground md:px-4 ${
                  active ? "bg-white/[0.06] text-foreground" : ""
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/admin"
            className="ml-1 rounded-full border border-white/10 px-3 py-2 text-muted/80 transition hover:border-white/20 hover:text-foreground md:ml-2 md:px-4"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
