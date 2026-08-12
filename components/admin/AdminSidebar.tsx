"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Palette,
  Share2,
  Monitor,
  Film,
  Camera,
  ImageIcon,
  Settings,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/branding", label: "Branding", icon: Palette },
  { href: "/admin/social-media", label: "Social Media", icon: Share2 },
  { href: "/admin/web-design", label: "Web Design", icon: Monitor },
  { href: "/admin/video-production", label: "Video Production", icon: Film },
  { href: "/admin/photoshooting", label: "Photoshooting", icon: Camera },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-surface/40">
      <div className="border-b border-border px-5 py-5">
        <p className="font-display text-lg leading-tight">CMA Admin</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted">Portfolio CMS</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {nav.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-accent-soft text-foreground"
                  : "text-muted hover:bg-surface-elevated hover:text-foreground"
              }`}
            >
              <Icon size={16} strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-border p-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft size={14} /> Faqja publike
        </Link>
        <Link
          href="/branding"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground"
        >
          <ExternalLink size={14} /> Portfolio
        </Link>
      </div>
    </aside>
  );
}
