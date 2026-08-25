"use client";

import Link from "next/link";
import { useMemo } from "react";
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

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

type FlatProject = {
  key: string;
  title: string;
  href: string;
  service: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
  mediaId?: string;
  imageUrl?: string;
};

function parseTime(iso: string): number {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

function MonthBars({
  months,
}: {
  months: { label: string; count: number }[];
}) {
  const max = Math.max(1, ...months.map((m) => m.count));
  const peak = Math.max(0, ...months.map((m) => m.count));

  return (
    <div className="flex h-44 items-end gap-2.5">
      {months.map((m, i) => {
        const highlight = peak > 0 && m.count === peak;
        return (
          <div
            key={`${m.label}-${i}`}
            className="flex h-full flex-1 flex-col items-center justify-end gap-2"
          >
            <span className="text-[10px] tabular-nums text-muted">
              {m.count || ""}
            </span>
            <div
              className={`w-full rounded-full ${
                highlight ? "bg-[#FDD85D]" : "bg-[#1a1a1a]/10"
              }`}
              style={{ height: `${Math.max(10, (m.count / max) * 100)}%` }}
            />
            <span className="text-[10px] text-muted">{m.label}</span>
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

export function ContentManagerDashboard() {
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

  const anyLoading =
    loading || socialLoading || videoLoading || photoLoading || webLoading;

  const all: FlatProject[] = useMemo(() => {
    const rows: FlatProject[] = [
      ...projects.map((p) => {
        const cover = getProjectCover(p);
        return {
          key: `branding-${p.id}`,
          title: p.title,
          href: `/admin/branding/${p.id}`,
          service: "Branding",
          status: p.status,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          mediaId: cover.coverMediaId,
          imageUrl: cover.coverUrl,
        };
      }),
      ...socialProjects.map((p) => ({
        key: `social-${p.id}`,
        title: p.title,
        href: `/admin/social-media/${p.id}`,
        service: "Social Media",
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        mediaId: p.coverMediaId,
        imageUrl: p.coverImageUrl,
      })),
      ...webProjects.map((p) => ({
        key: `web-${p.id}`,
        title: p.title,
        href: `/admin/web-design/${p.id}`,
        service: "Web Design",
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        mediaId: p.coverMediaId,
        imageUrl: p.coverImageUrl,
      })),
      ...videos.map((p) => ({
        key: `video-${p.id}`,
        title: p.title,
        href: `/admin/video-production/${p.id}`,
        service: "Video",
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        imageUrl: p.youtubeId
          ? `https://img.youtube.com/vi/${p.youtubeId}/hqdefault.jpg`
          : undefined,
      })),
      ...photoProjects.map((p) => ({
        key: `photo-${p.id}`,
        title: p.title,
        href: `/admin/photoshooting/${p.id}`,
        service: "Photoshooting",
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        mediaId: p.coverMediaId,
        imageUrl: p.coverImageUrl,
      })),
    ];
    return rows;
  }, [projects, socialProjects, webProjects, videos, photoProjects]);

  const services: {
    href: string;
    label: string;
    icon: LucideIcon;
    total: number;
    published: number;
    drafts: number;
  }[] = useMemo(
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

  const total = all.length;
  const published = all.filter((p) => p.status === "published").length;
  const drafts = all.filter((p) => p.status === "draft").length;
  const publishedRatio = total > 0 ? Math.round((published / total) * 100) : 0;

  const monthly = useMemo(() => {
    const now = new Date();
    const buckets: { key: string; label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      buckets.push({
        key,
        label: MONTHS[d.getUTCMonth()],
        count: 0,
      });
    }
    const index = new Map(buckets.map((b, i) => [b.key, i]));
    for (const p of all) {
      const t = parseTime(p.createdAt);
      if (!t) continue;
      const d = new Date(t);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      const i = index.get(key);
      if (i != null) buckets[i].count += 1;
    }
    return buckets;
  }, [all]);

  const addedThisMonth = monthly[monthly.length - 1]?.count ?? 0;
  const addedPrevMonth = monthly[monthly.length - 2]?.count ?? 0;

  const recent = useMemo(
    () =>
      [...all]
        .sort((a, b) => parseTime(b.updatedAt) - parseTime(a.updatedAt))
        .slice(0, 8),
    [all],
  );

  const oldestDrafts = useMemo(
    () =>
      all
        .filter((p) => p.status === "draft")
        .sort((a, b) => parseTime(a.updatedAt) - parseTime(b.updatedAt))
        .slice(0, 5),
    [all],
  );

  const slides: SlideshowSlide[] = useMemo(
    () =>
      [...all]
        .sort((a, b) => parseTime(b.updatedAt) - parseTime(a.updatedAt))
        .slice(0, 12)
        .map((p) => ({
          id: p.key,
          title: p.title,
          href: p.href,
          service: p.service,
          status: p.status,
          mediaId: p.mediaId,
          imageUrl: p.imageUrl,
        })),
    [all],
  );

  const headerBars = [
    {
      label: "Published",
      value: published,
      max: Math.max(1, total),
      tone: "yellow" as const,
    },
    {
      label: "Draft",
      value: drafts,
      max: Math.max(1, total),
      tone: "muted" as const,
    },
    {
      label: "This month",
      value: addedThisMonth,
      max: Math.max(1, addedThisMonth, addedPrevMonth, 1),
      tone: "dark" as const,
    },
    {
      label: "Total",
      value: total,
      max: Math.max(1, total),
      tone: "stripe" as const,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1>Welcome</h1>
          <p className="mt-2 text-sm text-muted">
            Overview of projects, categories, and recent activity.
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
                      width: `${Math.max(8, (bar.value / Math.max(1, bar.max)) * 100)}%`,
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
                {anyLoading ? "…" : published}
              </p>
              <p className="text-[11px] text-muted">Published</p>
            </div>
            <div>
              <p className="text-3xl font-semibold tracking-tight">
                {anyLoading ? "…" : drafts}
              </p>
              <p className="text-[11px] text-muted">Draft</p>
            </div>
            <div>
              <p className="text-3xl font-semibold tracking-tight">
                {anyLoading ? "…" : addedThisMonth}
              </p>
              <p className="text-[11px] text-muted">Added this month</p>
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
              <p className="text-sm font-medium">New projects by month</p>
              <p className="mt-1 text-xs text-muted">Last 6 months</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold tracking-tight">
                {anyLoading ? "…" : addedThisMonth}
              </p>
              <p className="text-xs text-muted">
                {addedPrevMonth > 0
                  ? `${addedThisMonth - addedPrevMonth >= 0 ? "+" : ""}${addedThisMonth - addedPrevMonth} vs last month`
                  : "this month"}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <MonthBars months={monthly} />
          </div>
        </section>

        <section className="admin-card flex flex-col items-center justify-center p-5 lg:col-span-3">
          <p className="mb-2 text-sm font-medium">Live status</p>
          <ProgressRing
            percent={publishedRatio || (anyLoading ? 0 : 8)}
            center={anyLoading ? "…" : `${publishedRatio}%`}
            caption="published"
          />
          <p className="mt-2 text-xs text-muted">
            {anyLoading
              ? "Loading…"
              : `${published} live · ${drafts} draft`}
          </p>
        </section>

        <section className="admin-card p-5 lg:col-span-7">
          <p className="text-sm font-medium">Projects by category</p>
          <p className="mt-0.5 text-xs text-muted">Total / published / draft</p>
          <div className="mt-4 space-y-4">
            {services.map((s) => {
              const Icon = s.icon;
              const pct = total ? Math.round((s.total / total) * 100) : 0;
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
            <p className="text-sm font-medium">Recent projects</p>
            <span className="rounded-full bg-[#FDD85D] px-2.5 py-0.5 text-[11px] font-medium text-[#1a1a1a]">
              {Math.min(recent.length, 8)}/8
            </span>
          </div>
          <p className="mt-4 text-4xl font-semibold tracking-tight">
            {anyLoading ? "…" : total}
          </p>
          <p className="text-sm text-white/50">
            projects total · {published} live
          </p>
          <div className="mt-5 space-y-3">
            {recent.map((item, i) => (
              <Link
                key={item.key}
                href={item.href}
                className="flex items-center gap-3"
              >
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
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white/80">{item.title}</p>
                  <p className="text-[11px] text-white/40">
                    {item.service} ·{" "}
                    {item.status === "published" ? "published" : "draft"}
                  </p>
                </div>
              </Link>
            ))}
            {!recent.length ? (
              <p className="text-sm text-white/50">
                No projects yet.
              </p>
            ) : null}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-white/45">
              <FileEdit size={13} />
              {publishedRatio}% are live
            </div>
            <Link
              href="/admin/branding"
              className="inline-flex items-center gap-1 text-sm font-medium text-white"
            >
              Open projects <ArrowUpRight size={14} />
            </Link>
          </div>
        </section>

        {oldestDrafts.length > 0 ? (
          <section className="admin-card p-5 lg:col-span-12">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Drafts waiting</p>
                <p className="mt-0.5 text-xs text-muted">
                  Oldest ones that are not published yet
                </p>
              </div>
              <span className="text-xs text-muted">{drafts} drafts total</span>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {oldestDrafts.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="block rounded-2xl bg-white/80 px-3 py-2.5 transition hover:bg-white"
                  >
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="mt-0.5 text-[11px] text-muted">
                      {item.service}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
