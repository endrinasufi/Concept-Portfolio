"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Pencil, Plus, X } from "lucide-react";
import type { AdminRole } from "@/lib/permissions";

type FrontContext = {
  role: AdminRole;
  email: string;
  editHref: string | null;
  editLabel: string | null;
};

const ADD_LINKS = [
  { href: "/admin/branding/new", label: "Branding" },
  { href: "/admin/social-media/new", label: "Social Media" },
  { href: "/admin/web-design/new", label: "Web Design" },
  { href: "/admin/video-production/new", label: "Video" },
  { href: "/admin/photoshooting/new", label: "Photoshooting" },
] as const;

export function AdminFrontDock() {
  const pathname = usePathname();
  const [ctx, setCtx] = useState<FrontContext | null>(null);
  const [openAdd, setOpenAdd] = useState(false);
  const addRef = useRef<HTMLDivElement>(null);

  const onAdmin = Boolean(pathname?.startsWith("/admin"));

  useEffect(() => {
    if (onAdmin) {
      setCtx(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/admin/front-context?path=${encodeURIComponent(pathname || "/")}`,
          { credentials: "include", cache: "no-store" },
        );
        if (!res.ok) {
          if (!cancelled) setCtx(null);
          return;
        }
        const data = (await res.json()) as FrontContext;
        if (!cancelled) setCtx(data);
      } catch {
        if (!cancelled) setCtx(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname, onAdmin]);

  useEffect(() => {
    setOpenAdd(false);
  }, [pathname]);

  useEffect(() => {
    const root = document.documentElement;
    if (ctx && !onAdmin) {
      root.dataset.cmsLoggedIn = ctx.role;
    } else {
      delete root.dataset.cmsLoggedIn;
    }
    return () => {
      delete root.dataset.cmsLoggedIn;
    };
  }, [ctx, onAdmin]);

  useEffect(() => {
    if (!openAdd) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && addRef.current?.contains(target)) return;
      setOpenAdd(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openAdd]);

  if (onAdmin || !ctx) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-[80] flex flex-col items-end gap-2"
      data-admin-front-dock
    >
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        {ctx.editHref ? (
          <Link
            href={ctx.editHref}
            aria-label="Edit project"
            className="group inline-flex h-11 max-w-11 items-center gap-0 overflow-hidden rounded-full bg-[#FDD85D] px-0 text-black shadow-[0_12px_32px_rgba(253,216,93,0.45)] transition-[max-width,padding,gap] duration-200 hover:max-w-[12rem] hover:gap-2 hover:px-4 hover:brightness-95"
          >
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-black">
              <Pencil size={18} strokeWidth={2.25} className="text-black" />
            </span>
            <span className="whitespace-nowrap pr-1 text-sm font-medium text-black opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              Edit project
            </span>
          </Link>
        ) : null}

        <div ref={addRef} className="relative flex items-end">
          {openAdd ? (
            <div className="absolute bottom-0 right-full mr-2 w-48 overflow-hidden rounded-2xl bg-[#1a1a1a] shadow-[0_16px_48px_rgba(26,26,26,0.35)]">
              <p className="border-b border-white/10 px-3 py-2 text-[11px] text-white/55">
                Add project
              </p>
              <ul className="py-1">
                {ADD_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block px-3 py-2 text-sm text-white transition hover:bg-white/10"
                      onClick={() => setOpenAdd(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setOpenAdd((v) => !v)}
            aria-label={openAdd ? "Close" : "Add project"}
            className={`inline-flex h-11 items-center overflow-hidden rounded-full bg-[#1a1a1a] text-white shadow-[0_12px_32px_rgba(26,26,26,0.28)] transition-[max-width,padding,gap] duration-200 hover:bg-[#2a2a2a] ${
              openAdd
                ? "max-w-[12rem] gap-2 px-4"
                : "group max-w-11 gap-0 px-0 hover:max-w-[12rem] hover:gap-2 hover:px-4"
            }`}
            aria-expanded={openAdd}
          >
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center">
              {openAdd ? (
                <X size={18} strokeWidth={2} />
              ) : (
                <Plus size={18} strokeWidth={2} />
              )}
            </span>
            <span
              className={`whitespace-nowrap pr-1 text-sm font-medium transition-opacity duration-200 ${
                openAdd
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              }`}
            >
              {openAdd ? "Close" : "Add project"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
