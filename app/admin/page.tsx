"use client";

import Link from "next/link";
import { useProjects } from "@/lib/hooks/useProjects";

export default function AdminDashboardPage() {
  const { projects, loading } = useProjects({ service: "branding", includeDrafts: true });
  const published = projects.filter((p) => p.status === "published").length;
  const drafts = projects.filter((p) => p.status === "draft").length;

  return (
    <div>
      <h1 className="font-display text-3xl">Dashboard</h1>
      <p className="mt-2 text-muted">Menaxho projektet branding lokalisht (IndexedDB).</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Projekte", value: loading ? "…" : projects.length },
          { label: "Publikuar", value: loading ? "…" : published },
          { label: "Draft", value: loading ? "…" : drafts },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[var(--radius-lg)] border border-border bg-surface/50 p-5"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted">{stat.label}</p>
            <p className="font-display mt-2 text-4xl">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/admin/branding"
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
        >
          Menaxho branding
        </Link>
        <Link
          href="/admin/branding/new"
          className="rounded-full border border-border px-5 py-2.5 text-sm"
        >
          Projekt i ri
        </Link>
      </div>
    </div>
  );
}
