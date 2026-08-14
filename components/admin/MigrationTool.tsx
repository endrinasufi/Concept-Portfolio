"use client";

import { useCallback, useState } from "react";
import { getDb } from "@/lib/repositories/legacy/db";

type ReportLine = {
  kind: string;
  id: string;
  ok: boolean;
  message?: string;
};

type Analysis = {
  projects: number;
  social: number;
  web: number;
  photo: number;
  video: number;
  media: number;
  mediaBlobs: number;
  settings: boolean;
};

export function MigrationTool() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<ReportLine[]>([]);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async () => {
    setError(null);
    try {
      const db = getDb();
      const [
        projects,
        social,
        web,
        photo,
        video,
        media,
        mediaBlobs,
        settings,
      ] = await Promise.all([
        db.projects.count(),
        db.socialMediaProjects.count(),
        db.webDesignProjects.count(),
        db.photoshooting.count(),
        db.videoProduction.count(),
        db.media.count(),
        db.mediaBlobs.count(),
        db.settings.get("site"),
      ]);
      setAnalysis({
        projects,
        social,
        web,
        photo,
        video,
        media,
        mediaBlobs,
        settings: Boolean(settings),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Nuk u lexua IndexedDB (hap në të njëjtin browser ku ke të dhënat).",
      );
    }
  }, []);

  const downloadBackup = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const db = getDb();
      const payload = {
        exportedAt: new Date().toISOString(),
        projects: await db.projects.toArray(),
        socialMediaProjects: await db.socialMediaProjects.toArray(),
        webDesignProjects: await db.webDesignProjects.toArray(),
        photoshooting: await db.photoshooting.toArray(),
        videoProduction: await db.videoProduction.toArray(),
        media: await db.media.toArray(),
        mediaIds: (await db.mediaBlobs.toArray()).map((b) => b.id),
        settings: (await db.settings.get("site")) ?? null,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cma-portfolio-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Backup dështoi");
    } finally {
      setBusy(false);
    }
  }, []);

  const migrate = useCallback(async () => {
    setBusy(true);
    setError(null);
    const lines: ReportLine[] = [];
    const push = (line: ReportLine) => {
      lines.push(line);
      setLog([...lines]);
    };

    try {
      const db = getDb();
      const mediaMeta = await db.media.toArray();
      const blobs = await db.mediaBlobs.toArray();
      const blobMap = new Map(blobs.map((b) => [b.id, b.blob]));

      for (const meta of mediaMeta) {
        const blob = blobMap.get(meta.id);
        if (!blob) {
          push({
            kind: "media",
            id: meta.id,
            ok: false,
            message: "Mungon blob",
          });
          continue;
        }
        try {
          const form = new FormData();
          form.append("file", blob, meta.filename || `media-${meta.id}`);
          form.append("id", meta.id);
          if (meta.width != null) form.append("width", String(meta.width));
          if (meta.height != null) form.append("height", String(meta.height));
          const res = await fetch("/api/admin/media", {
            method: "POST",
            credentials: "include",
            body: form,
          });
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          push({
            kind: "media",
            id: meta.id,
            ok: res.ok,
            message: res.ok ? undefined : data.error,
          });
        } catch (err) {
          push({
            kind: "media",
            id: meta.id,
            ok: false,
            message: err instanceof Error ? err.message : "fail",
          });
        }
      }

      async function upsertCollection(
        kind: string,
        path: string,
        items: { id: string }[],
      ) {
        for (const item of items) {
          try {
            const existing = await fetch(`${path}/${item.id}`, {
              credentials: "include",
            });
            const method = existing.ok ? "PATCH" : "POST";
            const url = existing.ok ? `${path}/${item.id}` : path;
            const body =
              method === "POST"
                ? item
                : (() => {
                    const { id: _id, createdAt: _c, ...rest } = item as {
                      id: string;
                      createdAt?: string;
                    } & Record<string, unknown>;
                    return rest;
                  })();
            const res = await fetch(url, {
              method,
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
            const data = (await res.json().catch(() => ({}))) as {
              error?: string;
            };
            push({
              kind,
              id: item.id,
              ok: res.ok,
              message: res.ok ? undefined : data.error,
            });
          } catch (err) {
            push({
              kind,
              id: item.id,
              ok: false,
              message: err instanceof Error ? err.message : "fail",
            });
          }
        }
      }

      await upsertCollection("branding", "/api/admin/branding", await db.projects.toArray());
      await upsertCollection(
        "social-media",
        "/api/admin/social-media",
        await db.socialMediaProjects.toArray(),
      );
      await upsertCollection(
        "web-design",
        "/api/admin/web-design",
        await db.webDesignProjects.toArray(),
      );
      await upsertCollection(
        "photoshooting",
        "/api/admin/photoshooting",
        await db.photoshooting.toArray(),
      );
      await upsertCollection(
        "video-production",
        "/api/admin/video-production",
        await db.videoProduction.toArray(),
      );

      const settings = await db.settings.get("site");
      if (settings) {
        try {
          const res = await fetch("/api/admin/settings", {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(settings),
          });
          push({
            kind: "settings",
            id: "site",
            ok: res.ok,
            message: res.ok ? undefined : "settings fail",
          });
        } catch (err) {
          push({
            kind: "settings",
            id: "site",
            ok: false,
            message: err instanceof Error ? err.message : "fail",
          });
        }
      }

      await analyze();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Migrimi dështoi");
    } finally {
      setBusy(false);
    }
  }, [analyze]);

  const failed = log.filter((l) => !l.ok);
  const okCount = log.filter((l) => l.ok).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Migrim IndexedDB → MySQL</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Lexon bazën lokale <code>cma-portfolio-v1</code>, bën backup JSON, pastaj
          ngarkon media + projekte në server (UPSERT, ID të ruajtura). IndexedDB{" "}
          <strong>nuk fshihet</strong> automatikisht.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void analyze()}
          className="rounded-full border border-border px-4 py-2 text-sm hover:bg-white disabled:opacity-50"
        >
          Analizo IndexedDB
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void downloadBackup()}
          className="rounded-full border border-border px-4 py-2 text-sm hover:bg-white disabled:opacity-50"
        >
          Shkarko backup JSON
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void migrate()}
          className="rounded-full bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"
        >
          {busy ? "Duke migruar…" : "Fillo migrimin"}
        </button>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      {analysis ? (
        <ul className="grid gap-2 text-sm text-muted sm:grid-cols-2 md:grid-cols-4">
          <li>Branding: {analysis.projects}</li>
          <li>Social: {analysis.social}</li>
          <li>Web: {analysis.web}</li>
          <li>Photo: {analysis.photo}</li>
          <li>Video: {analysis.video}</li>
          <li>Media meta: {analysis.media}</li>
          <li>Media blobs: {analysis.mediaBlobs}</li>
          <li>Settings: {analysis.settings ? "po" : "jo"}</li>
        </ul>
      ) : null}

      {log.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm">
            Sukses: {okCount} · Dështime: {failed.length}
          </p>
          <div className="admin-card max-h-80 overflow-auto p-3 font-mono text-xs">
            {log.map((line, i) => (
              <div
                key={`${line.kind}-${line.id}-${i}`}
                className={line.ok ? "text-muted" : "text-red-400"}
              >
                [{line.kind}] {line.id} — {line.ok ? "ok" : line.message || "fail"}
              </div>
            ))}
          </div>
          {failed.length > 0 ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void migrate()}
              className="rounded-full border border-border px-4 py-2 text-sm"
            >
              Retry (ri-ekzekuto migrimin)
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
