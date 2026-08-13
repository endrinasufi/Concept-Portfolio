"use client";

import Link from "next/link";
import { useProjects } from "@/lib/hooks/useProjects";
import { useSocialMediaProjects } from "@/lib/hooks/useSocialMediaProjects";
import { useVideoProduction } from "@/lib/hooks/useVideoProduction";
import { usePhotoshootingProjects } from "@/lib/hooks/usePhotoshooting";
import { useWebDesignProjects } from "@/lib/hooks/useWebDesignProjects";

export default function AdminDashboardPage() {
  const { projects, loading } = useProjects({ service: "branding", includeDrafts: true });
  const { projects: socialProjects, loading: socialLoading } = useSocialMediaProjects({
    includeDrafts: true,
  });
  const { videos, loading: videoLoading } = useVideoProduction({ includeDrafts: true });
  const { projects: photoProjects, loading: photoLoading } = usePhotoshootingProjects({
    includeDrafts: true,
  });
  const { projects: webProjects, loading: webLoading } = useWebDesignProjects({
    includeDrafts: true,
  });
  const published = projects.filter((p) => p.status === "published").length;
  const drafts = projects.filter((p) => p.status === "draft").length;
  const socialPublished = socialProjects.filter((p) => p.status === "published").length;
  const socialDrafts = socialProjects.filter((p) => p.status === "draft").length;
  const videoPublished = videos.filter((v) => v.status === "published").length;
  const videoDrafts = videos.filter((v) => v.status === "draft").length;
  const photoPublished = photoProjects.filter((p) => p.status === "published").length;
  const photoDrafts = photoProjects.filter((p) => p.status === "draft").length;
  const webPublished = webProjects.filter((p) => p.status === "published").length;
  const webDrafts = webProjects.filter((p) => p.status === "draft").length;

  return (
    <div>
      <h1 className="font-display text-3xl">Dashboard</h1>
      <p className="mt-2 text-muted">Menaxho projektet lokalisht (IndexedDB).</p>

      <h2 className="mt-10 text-xs uppercase tracking-[0.2em] text-muted">Branding</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
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

      <h2 className="mt-10 text-xs uppercase tracking-[0.2em] text-muted">Social Media</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Projekte", value: socialLoading ? "…" : socialProjects.length },
          { label: "Publikuar", value: socialLoading ? "…" : socialPublished },
          { label: "Draft", value: socialLoading ? "…" : socialDrafts },
        ].map((stat) => (
          <div
            key={`sm-${stat.label}`}
            className="rounded-[var(--radius-lg)] border border-border bg-surface/50 p-5"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted">{stat.label}</p>
            <p className="font-display mt-2 text-4xl">{stat.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-xs uppercase tracking-[0.2em] text-muted">Web Design</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Projekte", value: webLoading ? "…" : webProjects.length },
          { label: "Publikuar", value: webLoading ? "…" : webPublished },
          { label: "Draft", value: webLoading ? "…" : webDrafts },
        ].map((stat) => (
          <div
            key={`wd-${stat.label}`}
            className="rounded-[var(--radius-lg)] border border-border bg-surface/50 p-5"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted">{stat.label}</p>
            <p className="font-display mt-2 text-4xl">{stat.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-xs uppercase tracking-[0.2em] text-muted">Video Production</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Video", value: videoLoading ? "…" : videos.length },
          { label: "Publikuar", value: videoLoading ? "…" : videoPublished },
          { label: "Draft", value: videoLoading ? "…" : videoDrafts },
        ].map((stat) => (
          <div
            key={`vp-${stat.label}`}
            className="rounded-[var(--radius-lg)] border border-border bg-surface/50 p-5"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted">{stat.label}</p>
            <p className="font-display mt-2 text-4xl">{stat.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-xs uppercase tracking-[0.2em] text-muted">Photoshooting</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Projekte", value: photoLoading ? "…" : photoProjects.length },
          { label: "Publikuar", value: photoLoading ? "…" : photoPublished },
          { label: "Draft", value: photoLoading ? "…" : photoDrafts },
        ].map((stat) => (
          <div
            key={`ps-${stat.label}`}
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
          href="/admin/social-media"
          className="rounded-full border border-border px-5 py-2.5 text-sm"
        >
          Menaxho social media
        </Link>
        <Link
          href="/admin/web-design"
          className="rounded-full border border-border px-5 py-2.5 text-sm"
        >
          Menaxho web design
        </Link>
        <Link
          href="/admin/video-production"
          className="rounded-full border border-border px-5 py-2.5 text-sm"
        >
          Menaxho video
        </Link>
        <Link
          href="/admin/photoshooting"
          className="rounded-full border border-border px-5 py-2.5 text-sm"
        >
          Menaxho photoshooting
        </Link>
      </div>
    </div>
  );
}
