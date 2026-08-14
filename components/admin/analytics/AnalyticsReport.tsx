"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  AnalyticsRangeKey,
  AnalyticsRankRow,
  AnalyticsReport as Report,
} from "@/types/analytics";

const RANGES: { key: AnalyticsRangeKey; label: string }[] = [
  { key: "today", label: "Sot" },
  { key: "7d", label: "7 ditë" },
  { key: "28d", label: "28 ditë" },
  { key: "90d", label: "90 ditë" },
];

const nf = new Intl.NumberFormat("sq-AL");

function fmt(n: number, digits = 0): string {
  return new Intl.NumberFormat("sq-AL", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(n);
}

function deltaPct(current: number, previous: number): { text: string; up: boolean } {
  if (previous <= 0) return { text: current > 0 ? "e re" : "0%", up: current >= 0 };
  const pct = Math.round(((current - previous) / previous) * 100);
  return { text: `${pct > 0 ? "+" : ""}${pct}%`, up: pct >= 0 };
}

function flagEmoji(code: string): string {
  if (!code || code.length !== 2 || code === "??") return "🌍";
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)),
  );
}

export function AnalyticsReport() {
  const [range, setRange] = useState<AnalyticsRangeKey>("7d");
  const [data, setData] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const res = await fetch(`/api/admin/analytics/report?range=${range}`, {
          credentials: "include",
          cache: "no-store",
        });
        const json = (await res.json()) as Report & { error?: string };
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error || "Nuk u lexuan statistikat");
          setData(null);
          return;
        }
        setData(json);
      } catch {
        if (!cancelled) setError("Nuk u lidh me serverin");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [range]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="admin-serif text-4xl leading-none md:text-5xl">Analitika</h1>
          <p className="mt-2 text-sm text-muted">
            Vizitorë, origjina, pajisje dhe faqet më të lexuara — si Google Analytics, por
            brenda CMS-së.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {data ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-xs text-muted">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {nf.format(data.realtime)} aktivë tani
            </span>
          ) : null}
          <div className="flex rounded-full bg-white/70 p-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  range === r.key
                    ? "bg-[#1a1a1a] text-white"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? (
        <p className="admin-card p-5 text-sm text-red-600">{error}</p>
      ) : null}

      <KpiRow data={data} loading={loading} />

      <section className="admin-card p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Shikime dhe vizitorë</p>
            <p className="mt-0.5 text-xs text-muted">Krahasuar me periudhën e mëparshme</p>
          </div>
          <div className="flex gap-4 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <i className="h-2 w-2 rounded-full bg-[#1a1a1a]" /> Shikime
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="h-2 w-2 rounded-full bg-[#FDD85D]" /> Vizitorë
            </span>
          </div>
        </div>
        <TrendChart points={data?.timeseries ?? []} />
      </section>

      <div className="grid gap-4 lg:grid-cols-12">
        <RankCard
          className="lg:col-span-5"
          title="Shtetet"
          hint="Nga ku vijnë vizitorët"
          rows={data?.countries ?? []}
          leading="flag"
          empty="Shtetet shfaqen sapo të ketë vizita të reja."
        />
        <RankCard
          className="lg:col-span-7"
          title="Faqet"
          hint="Më të vizituarat"
          rows={data?.pages ?? []}
          empty="Nuk ka shikime në këtë periudhë."
        />
        <RankCard
          className="lg:col-span-4"
          title="Qytetet"
          hint="Vendndodhja më e ngushtë"
          rows={data?.cities ?? []}
          empty="Qyteti mbushet kur IP jepet nga hosti."
        />
        <RankCard
          className="lg:col-span-4"
          title="Burimet e trafikut"
          hint="Direct, social, search, referral"
          rows={data?.channels ?? []}
          empty="Nuk ka burime të klasifikuara."
        />
        <RankCard
          className="lg:col-span-4"
          title="Referrer"
          hint="Sitet që dërgojnë trafik"
          rows={data?.referrers ?? []}
          empty="Të gjitha vizitat janë Direct."
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <section className="admin-card p-5 lg:col-span-4">
          <p className="text-sm font-medium">Pajisjet</p>
          <p className="mt-0.5 text-xs text-muted">Desktop, mobil, tablet</p>
          <DeviceDonut rows={data?.devices ?? []} />
        </section>
        <RankCard
          className="lg:col-span-4"
          title="Shfletuesit"
          rows={data?.browsers ?? []}
          empty="—"
        />
        <RankCard
          className="lg:col-span-4"
          title="Sistemi operativ"
          rows={data?.os ?? []}
          empty="—"
        />
        <section className="admin-card p-5 lg:col-span-8">
          <p className="text-sm font-medium">Ora e ditës</p>
          <p className="mt-0.5 text-xs text-muted">Shikime sipas orës UTC</p>
          <HourBars hours={data?.hourly ?? []} />
        </section>
        <RankCard
          className="lg:col-span-4"
          title="Gjuha e shfletuesit"
          rows={data?.languages ?? []}
          empty="—"
        />
      </div>
    </div>
  );
}

function KpiRow({ data, loading }: { data: Report | null; loading: boolean }) {
  const cards = data
    ? [
        {
          label: "Vizitorë",
          value: fmt(data.users),
          delta: deltaPct(data.users, data.usersPrev),
          sub: `${fmt(data.newUsers)} të rinj · ${fmt(data.returningUsers)} kthyes`,
        },
        {
          label: "Shikime",
          value: fmt(data.pageviews),
          delta: deltaPct(data.pageviews, data.pageviewsPrev),
          sub: "pageviews",
        },
        {
          label: "Sesione",
          value: fmt(data.sessions),
          delta: deltaPct(data.sessions, data.sessionsPrev),
          sub: `${fmt(data.pagesPerSession, 1)} faqe / sesion`,
        },
        {
          label: "Bounce rate",
          value: `${Math.round(data.bounceRate * 100)}%`,
          delta: {
            ...deltaPct(data.bounceRate, data.bounceRatePrev),
            up: data.bounceRate <= data.bounceRatePrev,
          },
          sub: "vizita me 1 faqe",
        },
      ]
    : [
        { label: "Vizitorë", value: "…", delta: { text: "—", up: true }, sub: " " },
        { label: "Shikime", value: "…", delta: { text: "—", up: true }, sub: " " },
        { label: "Sesione", value: "…", delta: { text: "—", up: true }, sub: " " },
        { label: "Bounce rate", value: "…", delta: { text: "—", up: true }, sub: " " },
      ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="admin-card p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted">{card.label}</p>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] ${
                loading
                  ? "bg-[#1a1a1a]/5 text-muted"
                  : card.delta.up
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
              }`}
            >
              {card.delta.text}
            </span>
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{card.value}</p>
          <p className="mt-1 text-[11px] text-muted">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}

function TrendChart({
  points,
}: {
  points: { date: string; label: string; views: number; visitors: number }[];
}) {
  const [hover, setHover] = useState<number | null>(null);
  const w = 800;
  const h = 240;
  const pad = { l: 12, r: 12, t: 18, b: 32 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const max = Math.max(1, ...points.map((p) => p.views), ...points.map((p) => p.visitors));
  const x = (i: number) =>
    pad.l + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => pad.t + innerH - (v / max) * innerH;

  const viewsLine = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(p.views).toFixed(1)}`)
    .join(" ");
  const usersLine = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(p.visitors).toFixed(1)}`)
    .join(" ");
  const viewsArea =
    points.length > 0
      ? `${viewsLine} L${x(points.length - 1).toFixed(1)} ${pad.t + innerH} L${x(0).toFixed(1)} ${pad.t + innerH} Z`
      : "";

  const labels = useMemo(() => {
    if (points.length <= 8) return points.map((_, i) => i);
    const step = Math.ceil(points.length / 7);
    return points.map((_, i) => i).filter((i) => i % step === 0 || i === points.length - 1);
  }, [points]);

  const active = hover != null ? points[hover] : null;

  return (
    <div className="relative">
      {active ? (
        <div className="pointer-events-none absolute right-0 top-0 rounded-2xl bg-[#1a1a1a] px-3 py-2 text-white">
          <p className="text-[11px] text-white/55">{active.date}</p>
          <p className="text-sm">
            {fmt(active.views)} shikime · {fmt(active.visitors)} vizitorë
          </p>
        </div>
      ) : null}
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-56 w-full"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          if (points.length === 0) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          const i = Math.round(ratio * (points.length - 1));
          setHover(Math.max(0, Math.min(points.length - 1, i)));
        }}
      >
        <path d={viewsArea} fill="#1a1a1a" opacity="0.06" />
        <path d={viewsLine} fill="none" stroke="#1a1a1a" strokeWidth="2.2" />
        <path d={usersLine} fill="none" stroke="#FDD85D" strokeWidth="2.4" />
        {hover != null && points[hover] ? (
          <g>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={pad.t}
              y2={pad.t + innerH}
              stroke="#1a1a1a"
              strokeOpacity="0.15"
            />
            <circle cx={x(hover)} cy={y(points[hover].views)} r="4" fill="#1a1a1a" />
            <circle cx={x(hover)} cy={y(points[hover].visitors)} r="4" fill="#FDD85D" />
          </g>
        ) : null}
        {labels.map((i) => (
          <text
            key={points[i]?.date ?? i}
            x={x(i)}
            y={h - 8}
            textAnchor="middle"
            fill="#6b6b70"
            fontSize="11"
          >
            {points[i]?.label}
          </text>
        ))}
      </svg>
      {points.every((p) => p.views === 0) ? (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-muted">
          Nuk ka të dhëna për këtë periudhë.
        </p>
      ) : null}
    </div>
  );
}

function RankCard({
  title,
  hint,
  rows,
  className = "",
  leading,
  empty,
}: {
  title: string;
  hint?: string;
  rows: AnalyticsRankRow[];
  className?: string;
  leading?: "flag";
  empty: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.visitors || r.views));
  return (
    <section className={`admin-card p-5 ${className}`}>
      <p className="text-sm font-medium">{title}</p>
      {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
      <div className="mt-4 space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-muted">{empty}</p>
        ) : (
          rows.map((row) => (
            <div key={`${title}-${row.key}`}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  {leading === "flag" ? (
                    <span className="w-5 shrink-0 text-base leading-none">
                      {flagEmoji(row.key)}
                    </span>
                  ) : null}
                  <span className="truncate">{row.label}</span>
                </span>
                <span className="shrink-0 tabular-nums text-muted">
                  {fmt(row.visitors || row.views)}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#1a1a1a]/8">
                <div
                  className="h-full rounded-full bg-[#FDD85D]"
                  style={{
                    width: `${Math.max(4, ((row.visitors || row.views) / max) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function DeviceDonut({ rows }: { rows: AnalyticsRankRow[] }) {
  const total = rows.reduce((s, r) => s + r.views, 0) || 1;
  const colors = ["#1a1a1a", "#FDD85D", "#9aa3ad"];
  const r = 52;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="mt-4 flex items-center gap-6">
      <svg viewBox="0 0 140 140" className="h-36 w-36 -rotate-90">
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="#1a1a1a"
          strokeOpacity="0.08"
          strokeWidth="12"
        />
        {rows.map((row, i) => {
          const len = (row.views / total) * c;
          const dash = `${len} ${c - len}`;
          const el = (
            <circle
              key={row.key}
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke={colors[i % colors.length]}
              strokeWidth="12"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <ul className="space-y-2 text-sm">
        {rows.length === 0 ? (
          <li className="text-muted">Nuk ka të dhëna pajisjesh.</li>
        ) : (
          rows.map((row, i) => (
            <li key={row.key} className="flex items-center gap-2">
              <i
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: colors[i % colors.length] }}
              />
              <span>{row.label}</span>
              <span className="text-muted">
                {Math.round((row.views / total) * 100)}%
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function HourBars({ hours }: { hours: { hour: number; views: number }[] }) {
  const max = Math.max(1, ...hours.map((h) => h.views));
  return (
    <div className="mt-5 flex h-36 items-end gap-1">
      {hours.map((h) => (
        <div key={h.hour} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
          <div
            className="w-full rounded-full bg-[#1a1a1a]/80"
            style={{ height: `${Math.max(h.views ? 8 : 3, (h.views / max) * 100)}%` }}
            title={`${h.hour}:00 · ${h.views}`}
          />
          {h.hour % 3 === 0 ? (
            <span className="text-[9px] text-muted">{h.hour}</span>
          ) : (
            <span className="text-[9px] text-transparent">0</span>
          )}
        </div>
      ))}
    </div>
  );
}
