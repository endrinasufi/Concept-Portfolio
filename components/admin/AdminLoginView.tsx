"use client";

import { AdminBrandLogo } from "@/components/admin/AdminBrandLogo";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export function AdminLoginView({ nextPath }: { nextPath: string }) {
  return (
    <div className="admin-light min-h-screen p-4 text-foreground md:p-8">
      <div className="admin-shell mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl overflow-hidden md:min-h-[calc(100vh-4rem)]">
        <aside className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-[#1a1a1a] p-12 text-white md:flex">
          <div className="pointer-events-none absolute -right-10 -top-14 h-52 w-52 rounded-full bg-[#FDD85D]" />
          <div className="pointer-events-none absolute bottom-16 left-8 h-28 w-28 rounded-full border-[7px] border-[#FDD85D]" />
          <p className="pointer-events-none absolute -bottom-10 -left-3 text-[8.5rem] font-semibold leading-none tracking-tight text-white/5">
            CMA
          </p>

          <AdminBrandLogo height={42} onDark />

          <div className="relative z-10 max-w-sm">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
              Studio CMS
            </p>
            <h1 className="mt-3 text-[2.25rem] font-semibold leading-[1.1] tracking-tight">
              Hyr në hapësirën e punës.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              Concept Marketing Albania — menaxho projektet e portfolios.
            </p>
          </div>

          <p className="relative z-10 text-[11px] uppercase tracking-[0.18em] text-white/30">
            Portfolio · 2026
          </p>
        </aside>

        <div className="flex flex-1 flex-col justify-center px-8 py-12 md:px-16 lg:px-20">
          <div className="mb-8 md:hidden">
            <AdminBrandLogo height={36} />
          </div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
            Admin
          </p>
          <h2 className="mt-2 text-[2.25rem] font-semibold leading-none tracking-tight">Mirë se erdhe</h2>
          <p className="mt-2 text-sm text-muted">
            Vendos kredencialet për të vazhduar.
          </p>
          <AdminLoginForm nextPath={nextPath} />
        </div>
      </div>
    </div>
  );
}
