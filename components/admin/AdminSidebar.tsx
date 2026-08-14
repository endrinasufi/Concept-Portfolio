"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AdminBrandLogo } from "@/components/admin/AdminBrandLogo";
import {
  LayoutDashboard,
  BarChart3,
  Palette,
  Share2,
  Monitor,
  Film,
  Camera,
  ImageIcon,
  Settings,
  ExternalLink,
  ArrowLeft,
  LogOut,
  Database,
} from "lucide-react";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/analytics", label: "Analitika", icon: BarChart3 },
  { href: "/admin/branding", label: "Branding", icon: Palette },
  { href: "/admin/social-media", label: "Social Media", icon: Share2 },
  { href: "/admin/web-design", label: "Web Design", icon: Monitor },
  { href: "/admin/video-production", label: "Video Production", icon: Film },
  { href: "/admin/photoshooting", label: "Photoshooting", icon: Camera },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/migration", label: "Migrim", icon: Database },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col">
      <div className="px-3 pt-6 pb-11">
        <div className="flex min-h-8 items-center px-3 pl-5">
          <AdminBrandLogo height={50} />
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {nav.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-full px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-foreground text-white"
                  : "text-muted hover:bg-white/50 hover:text-foreground"
              }`}
            >
              <Icon size={16} strokeWidth={1.6} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 p-3 pb-5">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted hover:bg-white/50 hover:text-foreground"
        >
          <ArrowLeft size={14} /> Faqja publike
        </Link>
        <Link
          href="/branding"
          className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted hover:bg-white/50 hover:text-foreground"
        >
          <ExternalLink size={14} /> Portfolio
        </Link>
        <button
          type="button"
          onClick={() => void logout()}
          className="flex w-full items-center gap-2 rounded-full px-3 py-2 text-left text-sm text-muted hover:bg-white/50 hover:text-foreground"
        >
          <LogOut size={14} /> Dil
        </button>
      </div>
    </aside>
  );
}
