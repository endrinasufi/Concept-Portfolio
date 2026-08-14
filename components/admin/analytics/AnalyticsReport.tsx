"use client";

import { LiveVisitorsMap } from "@/components/admin/analytics/LiveVisitorsMap";
import type {
  AnalyticsGrain,
  AnalyticsPoint,
  AnalyticsRankRow,
  AnalyticsReport as Report,
} from "@/types/analytics";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const GRAINS: { key: AnalyticsGrain; label: string }[] = [
  { key: "day", label: "Ditë" },
  { key: "week", label: "Javë" },
  { key: "month", label: "Muaj" },
  { key: "year", label: "Vit" },
];

const nf = new Intl.NumberFormat("sq-AL");

function fmt(n: number, digits = 0): string {
  return new Intl.NumberFormat("sq-AL", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(n);
}

function deltaPct(current: number, previous: number): { text: string; up: boolean } {
  if (previous <= 0) return { text: "", up: true };
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
  const [grain, setGrain] = useState<AnalyticsGrain>("week");
  const [offset, setOffset] = useState(0);
  const [compare, setCompare] = useState(false);
  const [data, setData] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let first = true;
    async function load() {
      if (first) {
        setLoading(true);
        setError(null);
      }
      try {
        const res = await fetch(
          `/api/admin/analytics/report?grain=${grain}&offset=${offset}`,
          { credentials: "include", cache: "no-store" },
        );
        const json = (await res.json()) as Report & { error?: string };
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error || "Nuk u lexuan statistikat");
          if (first) setData(null);
          return;
        }
        setData(json);
        setError(null);
      } catch {
        if (!cancelled && first) setError("Nuk u lidh me serverin");
      } finally {
        if (!cancelled) setLoading(false);
        first = false;
      }
    }
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 20000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [grain, offset]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1>Analitika</h1>
          <p className="mt-2 text-sm text-muted">
            Vizitorë, origjina, pajisje dhe faqet më të lexuara — brenda CMS-së.
          </p>
        </div>
      </div>

      {error ? (
        <p className="admin-card p-5 text-sm text-red-600">{error}</p>
      ) : null}

      <KpiRow data={data} loading={loading} />

      <LiveVisitorsMap
        realtime={data?.realtime ?? 0}
        countries={data?.liveCountries ?? []}
      />

      <section className="admin-card p-5 md:p-6">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium">Shikime dhe vizitorë</p>
            <p className="mt-0.5 text-xs text-muted">
              {compare
                ? `Krahasuar me ${data?.compareLabel ?? "periudhën e mëparshme"}`
                : data?.periodLabel ?? "Zgjidh periudhën"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-full bg-white p-1">
              {GRAINS.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => {
                    setGrain(g.key);
                    setOffset(0);
                  }}
                  className={`rounded-full px-3 py-1.5 text-sm transition ${
                    grain === g.key
                      ? "bg-[#1a1a1a] text-white"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <div className="inline-flex items-center rounded-full bg-white p-1">
              <button
                type="button"
                aria-label="Periudha e mëparshme"
                onClick={() => setOffset((v) => Math.max(-36, v - 1))}
                className="rounded-full p-1.5 text-muted hover:bg-[#1a1a1a]/6 hover:text-foreground"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="min-w-[5.5rem] px-1 text-center text-sm font-medium tabular-nums">
                {data?.periodLabel ?? "…"}
              </span>
              <button
                type="button"
                aria-label="Periudha tjetër"
                disabled={offset >= 0}
                onClick={() => setOffset((v) => Math.min(0, v + 1))}
                className="rounded-full p-1.5 text-muted hover:bg-[#1a1a1a]/6 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setCompare((v) => !v)}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                compare
                  ? "bg-[#1a1a1a] text-white"
                  : "bg-white text-muted hover:text-foreground"
              }`}
            >
              Krahaso
            </button>
          </div>
        </div>
        <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-[#1a1a1a]" /> Shikime
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-[#FDD85D]" /> Vizitorë
          </span>
          {compare ? (
            <>
              <span className="inline-flex items-center gap-1.5">
                <i className="h-2 w-4 border-t-2 border-dashed border-[#1a1a1a]/55" />{" "}
                Shikime · {data?.compareLabel}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <i className="h-2 w-4 border-t-2 border-dashed border-[#c9a83a]" />{" "}
                Vizitorë · {data?.compareLabel}
              </span>
            </>
          ) : null}
        </div>
        <TrendChart points={data?.timeseries ?? []} compare={compare} />
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
        {grain === "day" ? null : (
          <section className="admin-card p-5 lg:col-span-8">
            <p className="text-sm font-medium">Ora e ditës</p>
            <p className="mt-0.5 text-xs text-muted">Shikime sipas orës UTC</p>
            <HourBars hours={data?.hourly ?? []} />
          </section>
        )}
        <RankCard
          className={grain === "day" ? "lg:col-span-12" : "lg:col-span-4"}
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
            {card.delta.text ? (
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
            ) : null}
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
  compare,
}: {
  points: AnalyticsPoint[];
  compare: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const w = 960;
  const h = 340;
  const pad = { l: 40, r: 12, t: 14, b: 26 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const max = Math.max(
    1,
    ...points.map((p) => p.views),
    ...points.map((p) => p.visitors),
    ...(compare ? points.map((p) => p.viewsPrev) : []),
    ...(compare ? points.map((p) => p.visitorsPrev) : []),
  );
  const x = (i: number) =>
    pad.l + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => pad.t + innerH - (v / max) * innerH;
  const ticks = [0, 0.5, 1].map((t) => Math.round(max * t));

  function line(
    get: (p: AnalyticsPoint) => number,
  ): string {
    return points
      .map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(get(p)).toFixed(1)}`)
      .join(" ");
  }

  const viewsLine = line((p) => p.views);
  const usersLine = line((p) => p.visitors);
  const viewsPrevLine = line((p) => p.viewsPrev);
  const usersPrevLine = line((p) => p.visitorsPrev);
  const viewsArea =
    points.length > 0
      ? `${viewsLine} L${x(points.length - 1).toFixed(1)} ${pad.t + innerH} L${x(0).toFixed(1)} ${pad.t + innerH} Z`
      : "";

  const labels = useMemo(() => {
    if (points.length <= 10) return points.map((_, i) => i);
    const step = Math.ceil(points.length / 8);
    return points.map((_, i) => i).filter((i) => i % step === 0 || i === points.length - 1);
  }, [points]);

  const active = hover != null ? points[hover] : null;
  const tooltipLeft =
    hover == null
      ? 50
      : Math.min(86, Math.max(14, (x(hover) / w) * 100));
  const empty = points.every(
    (p) => p.views === 0 && (!compare || p.viewsPrev === 0),
  );

  return (
    <div className="relative">
      {active ? (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-2xl bg-[#1a1a1a] px-3 py-2 text-white"
          style={{ left: `${tooltipLeft}%`, top: 4 }}
        >
          <p className="text-[10px] text-white/55">{active.label}</p>
          <p className="whitespace-nowrap text-xs">
            {fmt(active.views)} shikime · {fmt(active.visitors)} vizitorë
          </p>
          {compare ? (
            <p className="mt-0.5 whitespace-nowrap text-[10px] text-white/55">
              Më parë: {fmt(active.viewsPrev)} · {fmt(active.visitorsPrev)}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="relative h-[16rem] w-full md:h-[20rem]">
        {ticks.map((tick) => (
          <span
            key={`yt-${tick}`}
            className="pointer-events-none absolute left-0 -translate-y-1/2 text-[10px] leading-none text-muted tabular-nums"
            style={{ top: `${(y(tick) / h) * 100}%` }}
          >
            {fmt(tick)}
          </span>
        ))}
        <svg
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          {ticks.map((tick) => (
            <line
              key={`gl-${tick}`}
              x1={pad.l}
              x2={w - pad.r}
              y1={y(tick)}
              y2={y(tick)}
              stroke="#1a1a1a"
              strokeOpacity="0.08"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path d={viewsArea} fill="#1a1a1a" opacity="0.06" />
          {compare ? (
            <>
              <path
                d={viewsPrevLine}
                fill="none"
                stroke="#1a1a1a"
                strokeOpacity="0.35"
                strokeWidth="2"
                strokeDasharray="6 5"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={usersPrevLine}
                fill="none"
                stroke="#C9A83A"
                strokeWidth="2"
                strokeDasharray="6 5"
                vectorEffect="non-scaling-stroke"
              />
            </>
          ) : null}
          <path
            d={viewsLine}
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="2.4"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={usersLine}
            fill="none"
            stroke="#FDD85D"
            strokeWidth="2.6"
            vectorEffect="non-scaling-stroke"
          />
          {hover != null ? (
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={pad.t}
              y2={pad.t + innerH}
              stroke="#1a1a1a"
              strokeOpacity="0.18"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
        </svg>
        {hover != null && points[hover] ? (
          <>
            <span
              className="pointer-events-none absolute z-[1] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1a1a1a]"
              style={{
                left: `${(x(hover) / w) * 100}%`,
                top: `${(y(points[hover].views) / h) * 100}%`,
              }}
            />
            <span
              className="pointer-events-none absolute z-[1] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#1a1a1a] bg-[#FDD85D]"
              style={{
                left: `${(x(hover) / w) * 100}%`,
                top: `${(y(points[hover].visitors) / h) * 100}%`,
              }}
            />
          </>
        ) : null}
        {labels.map((i) => (
          <span
            key={points[i]?.date ?? i}
            className="pointer-events-none absolute bottom-0 -translate-x-1/2 text-[10px] leading-none text-muted"
            style={{ left: `${(x(i) / w) * 100}%` }}
          >
            {points[i]?.label}
          </span>
        ))}
        <div
          className="absolute"
          style={{
            left: `${(pad.l / w) * 100}%`,
            right: `${(pad.r / w) * 100}%`,
            top: `${(pad.t / h) * 100}%`,
            bottom: `${(pad.b / h) * 100}%`,
          }}
          onMouseLeave={() => setHover(null)}
        >
          <div className="flex h-full">
            {points.map((p, i) => (
              <button
                key={p.date}
                type="button"
                aria-label={`${p.label}: ${p.views} shikime, ${p.visitors} vizitorë`}
                className="h-full min-w-0 flex-1 cursor-crosshair bg-transparent"
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
              />
            ))}
          </div>
        </div>
      </div>
      {empty ? (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted">
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
