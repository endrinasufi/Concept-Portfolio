"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Globe } from "lucide-react";
import {
  WORLD_MAP_PATHS,
  WORLD_MAP_VIEWBOX,
} from "@/lib/analytics/worldMapPaths";
import {
  fitCountryViewBox,
  formatViewBox,
  largestPathBBoxByCountry,
  lerpViewBox,
  parseViewBox,
  type MapViewBox,
} from "@/lib/analytics/mapZoom";
import type { AnalyticsRankRow } from "@/types/analytics";

const nf = new Intl.NumberFormat("sq-AL");
const WORLD_VB = parseViewBox(WORLD_MAP_VIEWBOX);
const ZOOM_MS = 480;

export function LiveVisitorsMap({
  realtime,
  countries,
}: {
  realtime: number;
  countries: AnalyticsRankRow[];
}) {
  const [hover, setHover] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [viewBox, setViewBox] = useState(WORLD_MAP_VIEWBOX);
  const vbRef = useRef<MapViewBox>(WORLD_VB);
  const animRef = useRef<number | null>(null);

  const byCode = useMemo(() => {
    const map = new Map<string, AnalyticsRankRow>();
    for (const row of countries) {
      const code = row.key.toUpperCase();
      if (!code || code === "UNKNOWN") continue;
      map.set(code, row);
    }
    return map;
  }, [countries]);

  const bboxes = useMemo(
    () => largestPathBBoxByCountry(WORLD_MAP_PATHS),
    [],
  );

  const max = Math.max(1, ...countries.map((c) => c.visitors));
  const listed = countries.filter((c) => c.visitors > 0).slice(0, 8);
  const activeCode = hover ?? focused;
  const active = activeCode ? byCode.get(activeCode) : null;

  const animateTo = useCallback((target: MapViewBox, code: string | null) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const from = vbRef.current;
    const t0 = performance.now();
    setFocused(code);
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / ZOOM_MS);
      const next = lerpViewBox(from, target, t);
      vbRef.current = next;
      setViewBox(formatViewBox(next));
      if (t < 1) animRef.current = requestAnimationFrame(tick);
      else animRef.current = null;
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  const zoomOut = useCallback(() => {
    animateTo(WORLD_VB, null);
  }, [animateTo]);

  const zoomToCountry = useCallback(
    (code: string) => {
      const row = byCode.get(code);
      if (!row || row.visitors <= 0) return;
      if (focused === code) {
        zoomOut();
        return;
      }
      const bbox = bboxes.get(code);
      if (!bbox) return;
      animateTo(fitCountryViewBox(bbox, WORLD_VB), code);
    },
    [animateTo, bboxes, byCode, focused, zoomOut],
  );

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  useEffect(() => {
    if (!focused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") zoomOut();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focused, zoomOut]);

  return (
    <section className="admin-card overflow-hidden p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Vizitorë live</p>
          <p className="mt-0.5 text-xs text-muted">
            5 minutat e fundit · kliko shtetin për zoom
          </p>
        </div>
        <div className="flex items-center gap-2">
          {focused ? (
            <button
              type="button"
              onClick={zoomOut}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs text-muted transition hover:text-foreground"
            >
              <Globe size={13} />
              Shfaq botën
            </button>
          ) : null}
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs text-muted">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {nf.format(realtime)} aktivë tani
          </span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="relative lg:col-span-8">
          <svg
            viewBox={viewBox}
            className="h-[min(22rem,46vw)] w-full"
            role="img"
            aria-label="Harta e vizitorëve live sipas shtetit"
            onMouseLeave={() => setHover(null)}
          >
            {WORLD_MAP_PATHS.map((path, i) => {
              const row = byCode.get(path.id);
              const live = Boolean(row && row.visitors > 0);
              const on = hover === path.id || focused === path.id;
              const t = live ? 0.55 + (0.45 * (row?.visitors ?? 0)) / max : 0;
              return (
                <path
                  key={`${path.id}-${i}`}
                  d={path.d}
                  fill={
                    live
                      ? on
                        ? "#1a1a1a"
                        : `rgba(253, 216, 93, ${t.toFixed(3)})`
                      : on
                        ? "rgba(26,26,26,0.14)"
                        : "rgba(26,26,26,0.07)"
                  }
                  stroke="#fff"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                  className={live ? "cursor-pointer" : "cursor-default"}
                  onMouseEnter={() => setHover(path.id)}
                  onClick={() => {
                    if (live) zoomToCountry(path.id);
                    else if (focused) zoomOut();
                  }}
                />
              );
            })}
          </svg>
          {active ? (
            <div className="pointer-events-none absolute left-3 top-3 rounded-2xl bg-[#1a1a1a] px-3 py-2 text-white">
              <p className="text-[11px] text-white/55">{active.label}</p>
              <p className="text-sm">
                {nf.format(active.visitors)}{" "}
                {active.visitors === 1 ? "vizitor" : "vizitorë"}
              </p>
            </div>
          ) : null}
        </div>

        <ul className="space-y-2.5 lg:col-span-4">
          {listed.length === 0 ? (
            <li className="py-8 text-sm text-muted">
              Nuk ka vizitorë live për momentin.
            </li>
          ) : (
            listed.map((row) => {
              const code = row.key.toUpperCase();
              const on = hover === code || focused === code;
              return (
                <li key={row.key}>
                  <button
                    type="button"
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-2 py-1.5 text-left text-sm transition ${
                      on ? "bg-white" : "hover:bg-white/80"
                    }`}
                    onMouseEnter={() => setHover(code)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => zoomToCountry(code)}
                  >
                    <span className="min-w-0 truncate">{row.label}</span>
                    <span className="shrink-0 tabular-nums text-muted">
                      {nf.format(row.visitors)}
                    </span>
                  </button>
                  <div className="mx-2 h-1 overflow-hidden rounded-full bg-[#1a1a1a]/8">
                    <div
                      className="h-full rounded-full bg-[#FDD85D]"
                      style={{
                        width: `${Math.max(8, (row.visitors / max) * 100)}%`,
                      }}
                    />
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </section>
  );
}
