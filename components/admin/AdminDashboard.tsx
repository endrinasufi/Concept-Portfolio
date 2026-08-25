"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  Camera,
  CheckCircle2,
  FileEdit,
  Film,
  Monitor,
  Palette,
  Share2,
} from "lucide-react";
import { usePhotoshootingProjects } from "@/lib/hooks/usePhotoshooting";
import { useProjects } from "@/lib/hooks/useProjects";
import { useSocialMediaProjects } from "@/lib/hooks/useSocialMediaProjects";
import { useVideoProduction } from "@/lib/hooks/useVideoProduction";
import { useWebDesignProjects } from "@/lib/hooks/useWebDesignProjects";
import { getProjectCover } from "@/lib/utils/projectCover";
import {
  ProjectSlideshow,
  type SlideshowSlide,
} from "@/components/admin/ProjectSlideshow";

type AnalyticsSummary = {
  todayViews: number;
  todayVisitors: number;
  yesterdayViews: number;
  monthViews: number;
  monthVisitors: number;
  week: { label: string; date: string; views: number; visitors: number }[];
  topPages: { path: string; views: number }[];
};

type ServiceRow = {
  href: string;
  label: string;
  icon: LucideIcon;
  total: number;
  published: number;
  drafts: number;
};

function deltaPct(current: number, previous: number): string {
  if (previous <= 0) return current > 0 ? "+100%" : "0%";
  const pct = Math.round(((current - previous) / previous) * 100);
  return `${pct > 0 ? "+" : ""}${pct}%`;
}

function WeekBars({
  week,
}: {
  week: { label: string; views: number }[];
}) {
  const days =
    week.length > 0
      ? week
      : Array.from({ length: 7 }, (_, i) => ({ label: "—", views: 0 }));
  const max = Math.max(1, ...days.map((d) => d.views));
  const peak = Math.max(...days.map((d) => d.views));

  return (
    <div className="flex h-44 items-end gap-2.5">
      {days.map((d, i) => {
        const highlight = peak > 0 && d.views === peak;
        return (
          <div
            key={`${d.label}-${i}`}
            className="flex h-full flex-1 flex-col items-center justify-end gap-2"
          >
            <div
              className={`w-full rounded-full ${
                highlight ? "bg-[#FDD85D]" : "bg-[#1a1a1a]/10"
              }`}
              style={{ height: `${Math.max(10, (d.views / max) * 100)}%` }}
            />
            <span className="text-[10px] text-muted">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function ProgressRing({
  percent,
  center,
  caption,
}: {
  percent: number;
  center: string;
  caption: string;
}) {
  const r = 58;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="relative mx-auto h-40 w-40">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="#1a1a1a"
          strokeOpacity="0.08"
          strokeWidth="10"
        />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="#FDD85D"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-3xl font-semibold tracking-tight">{center}</p>
        <p className="mt-0.5 text-[11px] text-muted">{caption}</p>
      </div>
    </div>
  );
}

export function AdminDashboard() {
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

  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/analytics", {
          credentials: "include",
          cache: "no-store",
        });
        const data = (await res.json()) as AnalyticsSummary & { error?: string };
        if (cancelled) return;
        if (!res.ok) {
          setAnalyticsError(data.error || "Could not load visits");
          return;
        }
        setAnalytics(data);
      } catch {
        if (!cancelled) setAnalyticsError("Could not load visits");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const anyLoading =
    loading || socialLoading || videoLoading || photoLoading || webLoading;

  const services: ServiceRow[] = useMemo(
    () => [
      {
        href: "/admin/branding",
        label: "Branding",
        icon: Palette,
        total: projects.length,
        published: projects.filter((p) => p.status === "published").length,
        drafts: projects.filter((p) => p.status === "draft").length,
      },
      {
        href: "/admin/social-media",
        label: "Social Media",
        icon: Share2,
        total: socialProjects.length,
        published: socialProjects.filter((p) => p.status === "published").length,
        drafts: socialProjects.filter((p) => p.status === "draft").length,
      },
      {
        href: "/admin/web-design",
        label: "Web Design",
        icon: Monitor,
        total: webProjects.length,
        published: webProjects.filter((p) => p.status === "published").length,
        drafts: webProjects.filter((p) => p.status === "draft").length,
      },
      {
        href: "/admin/video-production",
        label: "Video",
        icon: Film,
        total: videos.length,
        published: videos.filter((v) => v.status === "published").length,
        drafts: videos.filter((v) => v.status === "draft").length,
      },
      {
        href: "/admin/photoshooting",
        label: "Photoshooting",
        icon: Camera,
        total: photoProjects.length,
        published: photoProjects.filter((p) => p.status === "published").length,
        drafts: photoProjects.filter((p) => p.status === "draft").length,
      },
    ],
    [projects, socialProjects, webProjects, videos, photoProjects],
  );

  const total = services.reduce((s, x) => s + x.total, 0);
  const published = services.reduce((s, x) => s + x.published, 0);
  const drafts = services.reduce((s, x) => s + x.drafts, 0);
  const publishedRatio = total > 0 ? Math.round((published / total) * 100) : 0;

  const slides: SlideshowSlide[] = useMemo(() => {
    const items: SlideshowSlide[] = [
      ...projects.map((p) => {
        const cover = getProjectCover(p);
        return {
          id: `branding-${p.id}`,
          title: p.title,
          href: `/admin/branding/${p.id}`,
          service: "Branding",
          status: p.status,
          mediaId: cover.coverMediaId,
          imageUrl: cover.coverUrl,
        };
      }),
      ...socialProjects.map((p) => ({
        id: `social-${p.id}`,
        title: p.title,
        href: `/admin/social-media/${p.id}`,
        service: "Social Media",
        status: p.status,
        mediaId: p.coverMediaId,
        imageUrl: p.coverImageUrl,
      })),
      ...webProjects.map((p) => ({
        id: `web-${p.id}`,
        title: p.title,
        href: `/admin/web-design/${p.id}`,
        service: "Web Design",
        status: p.status,
        mediaId: p.coverMediaId,
        imageUrl: p.coverImageUrl,
      })),
      ...videos.map((p) => ({
        id: `video-${p.id}`,
        title: p.title,
        href: `/admin/video-production/${p.id}`,
        service: "Video",
        status: p.status,
        imageUrl: p.youtubeId
          ? `https://img.youtube.com/vi/${p.youtubeId}/hqdefault.jpg`
          : undefined,
      })),
      ...photoProjects.map((p) => ({
        id: `photo-${p.id}`,
        title: p.title,
        href: `/admin/photoshooting/${p.id}`,
        service: "Photoshooting",
        status: p.status,
        mediaId: p.coverMediaId,
        imageUrl: p.coverImageUrl,
      })),
    ];
    return items.slice(0, 12);
  }, [projects, socialProjects, webProjects, videos, photoProjects]);

  const week = analytics?.week ?? [];
  const todayViews = analytics?.todayViews ?? 0;
  const todayVisitors = analytics?.todayVisitors ?? 0;
  const uniqueShare =
    todayViews > 0 ? Math.round((todayVisitors / todayViews) * 100) : 0;
  const maxWeek = Math.max(1, ...week.map((d) => d.views), todayViews || 1);

  const headerBars = [
    {
      label: "Views",
      value: todayViews,
      max: maxWeek,
      tone: "dark" as const,
    },
    {
      label: "Unique",
      value: todayVisitors,
      max: Math.max(1, todayViews),
      tone: "yellow" as const,
    },
    {
      label: "Live",
      value: published,
      max: Math.max(1, total),
      tone: "stripe" as const,
    },
    {
      label: "Draft",
      value: drafts,
      max: Math.max(1, total),
      tone: "muted" as const,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1>Welcome</h1>
          <p className="mt-2 text-sm text-muted">
            Site visits and uploaded projects.
          </p>
        </div>
        <div className="flex flex-1 flex-col gap-5 xl:max-w-3xl xl:flex-row xl:items-end xl:justify-end">
          <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
            {headerBars.map((bar) => (
              <div key={bar.label}>
                <p className="mb-2 text-[11px] text-muted">{bar.label}</p>
                <div className="h-2 overflow-hidden rounded-full bg-[#1a1a1a]/8">
                  <div
                    className={
                      bar.tone === "yellow"
                        ? "h-full rounded-full bg-[#FDD85D]"
                        : bar.tone === "dark"
                          ? "h-full rounded-full bg-[#1a1a1a]"
                          : bar.tone === "stripe"
                            ? "h-full rounded-full"
                            : "h-full rounded-full bg-[#1a1a1a]/20"
                    }
                    style={{
                      width: `${Math.max(8, (bar.value / bar.max) * 100)}%`,
                      backgroundImage:
                        bar.tone === "stripe"
                          ? "repeating-linear-gradient(135deg, #1a1a1a 0 5px, transparent 5px 10px)"
                          : undefined,
                      backgroundColor:
                        bar.tone === "stripe" ? "#e6e2da" : undefined,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-6">
            <div>
              <p className="text-3xl font-semibold tracking-tight">
                {analytics ? todayViews : "…"}
              </p>
              <p className="text-[11px] text-muted">Views today</p>
            </div>
            <div>
              <p className="text-3xl font-semibold tracking-tight">
                {analytics ? todayVisitors : "…"}
              </p>
              <p className="text-[11px] text-muted">Unique</p>
            </div>
            <div>
              <p className="text-3xl font-semibold tracking-tight">
                {anyLoading ? "…" : total}
              </p>
              <p className="text-[11px] text-muted">Projects</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <section className="relative min-h-[320px] overflow-hidden rounded-[2rem] bg-white/40 shadow-[0_12px_40px_rgba(26,26,26,0.06)] lg:col-span-4">
          {anyLoading ? null : <ProjectSlideshow slides={slides} />}
        </section>

        <section className="admin-card p-5 lg:col-span-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium">Weekly views</p>
              <p className="mt-1 text-xs text-muted">Last 7 days</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold tracking-tight">
                {analytics
                  ? analytics.week.reduce((s, d) => s + d.views, 0)
                  : "…"}
              </p>
              <Link
                href="/admin/analytics"
                className="text-xs text-muted hover:text-foreground"
              >
                Analytics →
              </Link>
            </div>
          </div>
          <div className="mt-4">
            <WeekBars week={week} />
          </div>
        </section>

        <section className="admin-card flex flex-col items-center justify-center p-5 lg:col-span-3">
          <p className="mb-2 text-sm font-medium">Views today</p>
          <ProgressRing
            percent={uniqueShare || (analytics ? 8 : 0)}
            center={analytics ? String(todayViews) : "…"}
            caption="views"
          />
          <p className="mt-2 text-xs text-muted">
            {analytics
              ? `${deltaPct(todayViews, analytics.yesterdayViews)} vs yesterday · ${todayVisitors} unique`
              : analyticsError || "Loading stats"}
          </p>
        </section>

        <section className="admin-card p-5 lg:col-span-7">
          <p className="text-sm font-medium">Uploaded projects</p>
          <div className="mt-4 space-y-4">
            {services.map((s) => {
              const Icon = s.icon;
              const pct = s.total ? Math.round((s.published / s.total) * 100) : 0;
              return (
                <Link key={s.href} href={s.href} className="block">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1a1a]/5 text-[#1a1a1a]">
                        <Icon size={16} strokeWidth={1.6} />
                      </span>
                      <div>
                        <p className="text-sm font-medium">{s.label}</p>
                        <p className="text-[11px] text-muted">
                          {s.published} published · {s.drafts} draft
                        </p>
                      </div>
                    </div>
                    <span className="text-sm tabular-nums text-muted">
                      {s.total}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#1a1a1a]/8">
                    <div
                      className="h-full rounded-full bg-[#FDD85D]"
                      style={{ width: `${Math.max(s.total ? 6 : 0, pct)}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-[2rem] bg-[#1a1a1a] p-5 text-white shadow-[0_12px_40px_rgba(26,26,26,0.12)] lg:col-span-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Top pages</p>
            <span className="rounded-full bg-[#FDD85D] px-2.5 py-0.5 text-[11px] font-medium text-[#1a1a1a]">
              {analytics?.topPages.length ?? 0}/8
            </span>
          </div>
          <p className="mt-4 text-4xl font-semibold tracking-tight">
            {analytics ? analytics.monthVisitors : "…"}
          </p>
          <p className="text-sm text-white/50">
            unique visitors this month · {analytics?.monthViews ?? 0} views
          </p>
          <div className="mt-5 space-y-3">
            {(analytics?.topPages.length ? analytics.topPages : []).map(
              (page, i) => (
                <div key={page.path} className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      i < 2
                        ? "bg-[#FDD85D] text-[#1a1a1a]"
                        : "bg-white/10 text-white/70"
                    }`}
                  >
                    {i < 2 ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <span className="text-[11px]">{i + 1}</span>
                    )}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm text-white/70">
                    {page.path}
                  </p>
                  <p className="tabular-nums text-sm">{page.views}</p>
                </div>
              ),
            )}
            {!analytics?.topPages.length ? (
              <p className="text-sm text-white/50">
                Visits start counting once someone opens the public site.
              </p>
            ) : null}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-white/45">
              <FileEdit size={13} />
              {publishedRatio}% of projects are live
            </div>
            <Link
              href="/admin/analytics"
              className="inline-flex items-center gap-1 text-sm font-medium text-white"
            >
              Analytics <ArrowUpRight size={14} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
