"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Camera,
  CheckCircle2,
  FileEdit,
  Film,
  LayoutDashboard,
  Monitor,
  Palette,
  Share2,
} from "lucide-react";
import { usePhotoshootingProjects } from "@/lib/hooks/usePhotoshooting";
import { useProjects } from "@/lib/hooks/useProjects";
import { useSocialMediaProjects } from "@/lib/hooks/useSocialMediaProjects";
import { useVideoProduction } from "@/lib/hooks/useVideoProduction";
import { useWebDesignProjects } from "@/lib/hooks/useWebDesignProjects";

type ServiceStat = {
  href: string;
  label: string;
  icon: LucideIcon;
  total: number;
  published: number;
  drafts: number;
  loading: boolean;
};

function countByStatus<T extends { status: string }>(items: T[]) {
  return {
    published: items.filter((item) => item.status === "published").length,
    drafts: items.filter((item) => item.status === "draft").length,
  };
}

function SkeletonBar() {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/6">
      <div className="h-full w-1/3 animate-pulse rounded-full bg-white/12" />
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  loading: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface/70 p-5">
      <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-accent/10 blur-2xl" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
            {label}
          </p>
          <p className="font-display mt-3 text-4xl tabular-nums tracking-tight">
            {loading ? "…" : value}
          </p>
          <p className="mt-1.5 text-xs text-muted">{hint}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Icon size={18} strokeWidth={1.75} />
        </span>
      </div>
    </div>
  );
}

function ServiceCard({ service }: { service: ServiceStat }) {
  const Icon = service.icon;
  const ratio =
    !service.loading && service.total > 0
      ? Math.round((service.published / service.total) * 100)
      : 0;

  return (
    <Link
      href={service.href}
      className="group relative overflow-hidden rounded-2xl border border-border bg-surface/60 p-5 transition hover:border-accent/30 hover:bg-surface-elevated"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/4 text-accent transition group-hover:bg-accent-soft">
            <Icon size={18} strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-sm font-medium">{service.label}</p>
            <p className="mt-0.5 text-xs text-muted">Hap menaxhimin</p>
          </div>
        </div>
        <p className="font-display text-3xl tabular-nums leading-none">
          {service.loading ? "…" : service.total}
        </p>
      </div>

      <div className="mt-6">
        {service.loading ? (
          <SkeletonBar />
        ) : (
          <div className="h-1.5 overflow-hidden rounded-full bg-white/6">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-500"
              style={{ width: `${ratio}%` }}
            />
          </div>
        )}
        <div className="mt-3 flex items-center justify-between text-xs text-muted">
          <span>
            {service.loading ? "…" : service.published} publikuar
          </span>
          <span>{service.loading ? "…" : service.drafts} draft</span>
        </div>
      </div>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const { projects, loading } = useProjects({
    service: "branding",
    includeDrafts: true,
  });
  const { projects: socialProjects, loading: socialLoading } =
    useSocialMediaProjects({ includeDrafts: true });
  const { videos, loading: videoLoading } = useVideoProduction({
    includeDrafts: true,
  });
  const { projects: photoProjects, loading: photoLoading } =
    usePhotoshootingProjects({ includeDrafts: true });
  const { projects: webProjects, loading: webLoading } = useWebDesignProjects({
    includeDrafts: true,
  });

  const branding = countByStatus(projects);
  const social = countByStatus(socialProjects);
  const video = countByStatus(videos);
  const photo = countByStatus(photoProjects);
  const web = countByStatus(webProjects);

  const anyLoading =
    loading || socialLoading || videoLoading || photoLoading || webLoading;
  const total =
    projects.length +
    socialProjects.length +
    videos.length +
    photoProjects.length +
    webProjects.length;
  const published =
    branding.published +
    social.published +
    video.published +
    photo.published +
    web.published;
  const drafts =
    branding.drafts + social.drafts + video.drafts + photo.drafts + web.drafts;

  const services: ServiceStat[] = [
    {
      href: "/admin/branding",
      label: "Branding",
      icon: Palette,
      total: projects.length,
      published: branding.published,
      drafts: branding.drafts,
      loading,
    },
    {
      href: "/admin/social-media",
      label: "Social Media",
      icon: Share2,
      total: socialProjects.length,
      published: social.published,
      drafts: social.drafts,
      loading: socialLoading,
    },
    {
      href: "/admin/web-design",
      label: "Web Design",
      icon: Monitor,
      total: webProjects.length,
      published: web.published,
      drafts: web.drafts,
      loading: webLoading,
    },
    {
      href: "/admin/video-production",
      label: "Video Production",
      icon: Film,
      total: videos.length,
      published: video.published,
      drafts: video.drafts,
      loading: videoLoading,
    },
    {
      href: "/admin/photoshooting",
      label: "Photoshooting",
      icon: Camera,
      total: photoProjects.length,
      published: photo.published,
      drafts: photo.drafts,
      loading: photoLoading,
    },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl">Dashboard</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Pasqyrë e projekteve në CMS. Kliko një shërbim për ta menaxhuar.
        </p>
      </div>

      <section>
        <p className="mb-4 text-[11px] uppercase tracking-[0.22em] text-muted">
          Pasqyra
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard
            label="Gjithsej"
            value={total}
            hint="Të gjitha shërbimet"
            icon={LayoutDashboard}
            loading={anyLoading}
          />
          <KpiCard
            label="Publikuar"
            value={published}
            hint="Të dukshme në site"
            icon={CheckCircle2}
            loading={anyLoading}
          />
          <KpiCard
            label="Draft"
            value={drafts}
            hint="Nuk janë live"
            icon={FileEdit}
            loading={anyLoading}
          />
        </div>
      </section>

      <section>
        <p className="mb-4 text-[11px] uppercase tracking-[0.22em] text-muted">
          Sipas shërbimit
        </p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.href} service={service} />
          ))}
        </div>
      </section>
    </div>
  );
}
