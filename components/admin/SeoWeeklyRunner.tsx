"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

export function SeoWeeklyRunner() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function run(force: boolean) {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/seo/run", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      });
      const data = (await res.json()) as {
        error?: string;
        scanned?: number;
        updated?: number;
        skipped?: number;
        usedOpenAi?: boolean;
      };
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(
        `Scanned ${data.scanned}, updated ${data.updated}, skipped ${data.skipped}${
          data.usedOpenAi ? " · OpenAI active" : " · SEO template"
        }.`,
      );
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-3 rounded-2xl bg-white/70 p-4">
      <div className="flex items-start gap-2">
        <Sparkles size={16} className="mt-0.5 text-muted" />
        <div>
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted">
            Automatic SEO
          </h2>
          <p className="mt-1 text-xs text-muted">
            Fills meta title/description for projects that are missing them. With
            an OpenAI key (Settings) it uses AI; otherwise templates. Weekly cron on
            Hostinger: every Monday 03:00 →{" "}
            <code className="text-foreground/70">/api/cron/seo-weekly</code>.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void run(false)}
          className="rounded-full bg-foreground px-4 py-1.5 text-[11px] font-medium text-white disabled:opacity-50"
        >
          {busy ? "Running…" : "Fill missing SEO"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void run(true)}
          className="rounded-full border border-border px-4 py-1.5 text-[11px] disabled:opacity-50"
        >
          Refresh all (force)
        </button>
      </div>
      {result ? <p className="text-xs text-muted">{result}</p> : null}
    </section>
  );
}
