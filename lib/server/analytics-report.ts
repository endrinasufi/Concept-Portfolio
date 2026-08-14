import { query, type RowDataPacket } from "@/lib/server/db";
import {
  ensureAnalyticsTable,
  fmtSqlDate,
  n,
} from "@/lib/server/analytics";
import { channelFromHost } from "@/lib/server/analytics-ua";
import type {
  AnalyticsGrain,
  AnalyticsRankRow,
  AnalyticsReport,
} from "@/types/analytics";

interface CountRow extends RowDataPacket {
  n: number | string;
}

interface SessionRow extends RowDataPacket {
  sessions: number | string;
  bounced: number | string;
}

interface DayRow extends RowDataPacket {
  day: string;
  views: number | string;
  visitors: number | string;
}

interface HourRow extends RowDataPacket {
  hour: number | string;
  views: number | string;
  visitors: number | string;
}

interface DimRow extends RowDataPacket {
  dim: string;
  views: number | string;
  visitors: number | string;
}

const WEEKDAYS = ["Die", "Hën", "Mar", "Mër", "Enj", "Pre", "Sht"];
const MONTHS = [
  "jan",
  "shk",
  "mar",
  "pri",
  "maj",
  "qer",
  "korr",
  "gush",
  "sht",
  "tet",
  "nën",
  "dhj",
];
const MONTHS_FULL = [
  "Janar",
  "Shkurt",
  "Mars",
  "Prill",
  "Maj",
  "Qershor",
  "Korrik",
  "Gusht",
  "Shtator",
  "Tetor",
  "Nëntor",
  "Dhjetor",
];

function utcDayStart(d = new Date()): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function addUtcDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

export function parseGrain(raw: string | null): AnalyticsGrain {
  if (raw === "day" || raw === "week" || raw === "month" || raw === "year") {
    return raw;
  }
  return "week";
}

export function parseOffset(raw: string | null): number {
  const value = Number(raw);
  if (!Number.isFinite(value)) return 0;
  return Math.min(0, Math.max(-36, Math.trunc(value)));
}

function utcMonday(d: Date): Date {
  const x = utcDayStart(d);
  const day = x.getUTCDay();
  return addUtcDays(x, day === 0 ? -6 : 1 - day);
}

function utcMonthStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function addUtcMonths(d: Date, months: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1));
}

function utcYearStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
}

function addUtcYears(d: Date, years: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear() + years, 0, 1));
}

function dayCount(from: Date, to: Date): number {
  return Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000));
}

function periodWindow(grain: AnalyticsGrain, offset: number) {
  const today = utcDayStart();
  const cap = addUtcDays(today, 1);

  if (grain === "day") {
    const from = addUtcDays(today, offset);
    const to = addUtcDays(from, 1);
    return {
      from,
      to,
      prevFrom: addUtcDays(from, -1),
      prevTo: from,
    };
  }

  if (grain === "week") {
    const from = addUtcDays(utcMonday(today), offset * 7);
    const rawTo = addUtcDays(from, 7);
    const to = rawTo > cap ? cap : rawTo;
    const days = dayCount(from, to);
    const prevFrom = addUtcDays(from, -7);
    return {
      from,
      to,
      prevFrom,
      prevTo: addUtcDays(prevFrom, days),
    };
  }

  if (grain === "month") {
    const from = addUtcMonths(utcMonthStart(today), offset);
    const rawTo = addUtcMonths(from, 1);
    const to = rawTo > cap ? cap : rawTo;
    const days = dayCount(from, to);
    const prevFrom = addUtcMonths(from, -1);
    return {
      from,
      to,
      prevFrom,
      prevTo: addUtcDays(prevFrom, days),
    };
  }

  const from = addUtcYears(utcYearStart(today), offset);
  const rawTo = addUtcYears(from, 1);
  const to = rawTo > cap ? cap : rawTo;
  const days = dayCount(from, to);
  const prevFrom = addUtcYears(from, -1);
  return {
    from,
    to,
    prevFrom,
    prevTo: addUtcDays(prevFrom, days),
  };
}

function formatPeriodLabel(grain: AnalyticsGrain, from: Date, to: Date): string {
  const last = addUtcDays(to, -1);
  const today = utcDayStart();
  if (grain === "day") {
    if (from.getTime() === today.getTime()) return "Sot";
    if (from.getTime() === addUtcDays(today, -1).getTime()) return "Dje";
    return `${from.getUTCDate()} ${MONTHS[from.getUTCMonth()]} ${from.getUTCFullYear()}`;
  }
  if (grain === "week") {
    const sameMonth = from.getUTCMonth() === last.getUTCMonth();
    if (sameMonth) {
      return `${from.getUTCDate()}–${last.getUTCDate()} ${MONTHS[last.getUTCMonth()]}`;
    }
    return `${from.getUTCDate()} ${MONTHS[from.getUTCMonth()]} – ${last.getUTCDate()} ${MONTHS[last.getUTCMonth()]}`;
  }
  if (grain === "year") {
    return String(from.getUTCFullYear());
  }
  return `${MONTHS_FULL[from.getUTCMonth()]} ${from.getUTCFullYear()}`;
}

function hourQuery(from: Date, to: Date) {
  return query<HourRow[]>(
    `SELECT HOUR(created_at) AS hour,
            COUNT(*) AS views,
            COUNT(DISTINCT visitor_hash) AS visitors
     FROM page_views
     WHERE created_at >= :from AND created_at < :to
     GROUP BY HOUR(created_at)`,
    { from: fmtSqlDate(from), to: fmtSqlDate(to) },
  );
}

function dayQuery(from: Date, to: Date) {
  return query<DayRow[]>(
    `SELECT DATE(created_at) AS day,
            COUNT(*) AS views,
            COUNT(DISTINCT visitor_hash) AS visitors
     FROM page_views
     WHERE created_at >= :from AND created_at < :to
     GROUP BY DATE(created_at)
     ORDER BY day ASC`,
    { from: fmtSqlDate(from), to: fmtSqlDate(to) },
  );
}

interface MonthRow extends RowDataPacket {
  ym: string;
  views: number | string;
  visitors: number | string;
}

function monthQuery(from: Date, to: Date) {
  return query<MonthRow[]>(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym,
            COUNT(*) AS views,
            COUNT(DISTINCT visitor_hash) AS visitors
     FROM page_views
     WHERE created_at >= :from AND created_at < :to
     GROUP BY DATE_FORMAT(created_at, '%Y-%m')
     ORDER BY ym ASC`,
    { from: fmtSqlDate(from), to: fmtSqlDate(to) },
  );
}

function sqlDay(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const s = String(value ?? "");
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return s.slice(0, 10);
}

async function countViews(from: Date, to: Date): Promise<number> {
  const [row] = await query<CountRow[]>(
    `SELECT COUNT(*) AS n FROM page_views
     WHERE created_at >= :from AND created_at < :to`,
    { from: fmtSqlDate(from), to: fmtSqlDate(to) },
  );
  return n(row?.n);
}

async function countUsers(from: Date, to: Date): Promise<number> {
  const [row] = await query<CountRow[]>(
    `SELECT COUNT(DISTINCT visitor_hash) AS n FROM page_views
     WHERE created_at >= :from AND created_at < :to`,
    { from: fmtSqlDate(from), to: fmtSqlDate(to) },
  );
  return n(row?.n);
}

async function sessionStats(
  from: Date,
  to: Date,
): Promise<{ sessions: number; bounced: number }> {
  const [row] = await query<SessionRow[]>(
    `SELECT COUNT(*) AS sessions,
            COALESCE(SUM(CASE WHEN n = 1 THEN 1 ELSE 0 END), 0) AS bounced
     FROM (
       SELECT visitor_hash, DATE(created_at) AS d, COUNT(*) AS n
       FROM page_views
       WHERE created_at >= :from AND created_at < :to
       GROUP BY visitor_hash, DATE(created_at)
     ) t`,
    { from: fmtSqlDate(from), to: fmtSqlDate(to) },
  );
  return { sessions: n(row?.sessions), bounced: n(row?.bounced) };
}

function rank(
  rows: DimRow[],
  label: (key: string) => string,
): AnalyticsRankRow[] {
  return rows.map((row) => {
    const key = String(row.dim || "");
    return {
      key: key || "unknown",
      label: label(key),
      views: n(row.views),
      visitors: n(row.visitors),
    };
  });
}

async function dimQuery(
  column: string,
  from: Date,
  to: Date,
  limit: number,
): Promise<DimRow[]> {
  return query<DimRow[]>(
    `SELECT COALESCE(NULLIF(TRIM(${column}), ''), '') AS dim,
            COUNT(*) AS views,
            COUNT(DISTINCT visitor_hash) AS visitors
     FROM page_views
     WHERE created_at >= :from AND created_at < :to
     GROUP BY 1
     ORDER BY visitors DESC, views DESC
     LIMIT ${limit}`,
    { from: fmtSqlDate(from), to: fmtSqlDate(to) },
  );
}

const countryNames = new Intl.DisplayNames(["sq"], { type: "region" });

export function countryLabel(code: string): string {
  if (!code) return "E panjohur";
  try {
    return countryNames.of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
}

const DEVICE_LABEL: Record<string, string> = {
  desktop: "Kompjuter",
  mobile: "Mobil",
  tablet: "Tablet",
};

export async function getAnalyticsReport(
  grain: AnalyticsGrain,
  offset = 0,
): Promise<AnalyticsReport> {
  await ensureAnalyticsTable();
  const { from, to, prevFrom, prevTo } = periodWindow(grain, offset);
  const bounds = { from: fmtSqlDate(from), to: fmtSqlDate(to) };

  const [
    pageviews,
    pageviewsPrev,
    users,
    usersPrev,
    currentSessions,
    prevSessions,
    newUsersRow,
    realtimeRow,
    liveCountryRows,
    dayRows,
    prevDayRows,
    monthRows,
    prevMonthRows,
    hourRows,
    prevHourRows,
    countryRows,
    cityRows,
    pageRows,
    referrerRows,
    deviceRows,
    browserRows,
    osRows,
    languageRows,
  ] = await Promise.all([
    countViews(from, to),
    countViews(prevFrom, prevTo),
    countUsers(from, to),
    countUsers(prevFrom, prevTo),
    sessionStats(from, to),
    sessionStats(prevFrom, prevTo),
    query<CountRow[]>(
      `SELECT COUNT(DISTINCT visitor_hash) AS n FROM page_views
       WHERE created_at >= :from AND created_at < :to
         AND visitor_hash NOT IN (
           SELECT DISTINCT visitor_hash FROM page_views WHERE created_at < :from
         )`,
      bounds,
    ),
    query<CountRow[]>(
      `SELECT COUNT(DISTINCT visitor_hash) AS n FROM page_views
       WHERE created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 5 MINUTE)`,
    ),
    query<DimRow[]>(
      `SELECT COALESCE(NULLIF(TRIM(country_code), ''), '') AS dim,
              COUNT(*) AS views,
              COUNT(DISTINCT visitor_hash) AS visitors
       FROM page_views
       WHERE created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 5 MINUTE)
       GROUP BY 1
       ORDER BY visitors DESC, views DESC
       LIMIT 40`,
    ),
    dayQuery(from, to),
    dayQuery(prevFrom, prevTo),
    grain === "year" ? monthQuery(from, to) : Promise.resolve([] as MonthRow[]),
    grain === "year"
      ? monthQuery(prevFrom, prevTo)
      : Promise.resolve([] as MonthRow[]),
    hourQuery(from, to),
    hourQuery(prevFrom, prevTo),
    dimQuery("country_code", from, to, 12),
    query<DimRow[]>(
      `SELECT CONCAT(COALESCE(NULLIF(TRIM(city), ''), 'E panjohur'), ' · ', COALESCE(NULLIF(TRIM(country_code), ''), '?')) AS dim,
              COUNT(*) AS views,
              COUNT(DISTINCT visitor_hash) AS visitors
       FROM page_views
       WHERE created_at >= :from AND created_at < :to
         AND NULLIF(TRIM(city), '') IS NOT NULL
       GROUP BY 1
       ORDER BY visitors DESC
       LIMIT 8`,
      bounds,
    ),
    dimQuery("path", from, to, 12),
    dimQuery("referrer_host", from, to, 10),
    dimQuery("device", from, to, 5),
    dimQuery("browser", from, to, 8),
    dimQuery("os", from, to, 8),
    dimQuery("language", from, to, 8),
  ]);

  const newUsers = n(newUsersRow[0]?.n);
  const returningUsers = Math.max(0, users - newUsers);
  const bounceRate =
    currentSessions.sessions > 0
      ? currentSessions.bounced / currentSessions.sessions
      : 0;
  const bounceRatePrev =
    prevSessions.sessions > 0
      ? prevSessions.bounced / prevSessions.sessions
      : 0;
  const pagesPerSession =
    currentSessions.sessions > 0 ? pageviews / currentSessions.sessions : 0;

  const byDay = new Map(
    dayRows.map((row) => [
      sqlDay(row.day),
      { views: n(row.views), visitors: n(row.visitors) },
    ]),
  );
  const byPrevDay = new Map(
    prevDayRows.map((row) => [
      sqlDay(row.day),
      { views: n(row.views), visitors: n(row.visitors) },
    ]),
  );
  const byMonth = new Map(
    monthRows.map((row) => [
      String(row.ym),
      { views: n(row.views), visitors: n(row.visitors) },
    ]),
  );
  const byPrevMonth = new Map(
    prevMonthRows.map((row) => [
      String(row.ym),
      { views: n(row.views), visitors: n(row.visitors) },
    ]),
  );
  const byHour = new Map(
    hourRows.map((row) => [
      n(row.hour),
      { views: n(row.views), visitors: n(row.visitors) },
    ]),
  );
  const byPrevHour = new Map(
    prevHourRows.map((row) => [
      n(row.hour),
      { views: n(row.views), visitors: n(row.visitors) },
    ]),
  );

  const monthCount = () => {
    const end = addUtcDays(to, -1);
    return (
      (end.getUTCFullYear() - from.getUTCFullYear()) * 12 +
      (end.getUTCMonth() - from.getUTCMonth()) +
      1
    );
  };

  const timeseries =
    grain === "day"
      ? Array.from({ length: 24 }, (_, hour) => {
          const cur = byHour.get(hour) ?? { views: 0, visitors: 0 };
          const prev = byPrevHour.get(hour) ?? { views: 0, visitors: 0 };
          return {
            date: `${from.toISOString().slice(0, 10)}T${String(hour).padStart(2, "0")}:00:00.000Z`,
            label: `${String(hour).padStart(2, "0")}:00`,
            views: cur.views,
            visitors: cur.visitors,
            viewsPrev: prev.views,
            visitorsPrev: prev.visitors,
          };
        })
      : grain === "year"
        ? Array.from({ length: Math.max(1, monthCount()) }, (_, i) => {
            const d = addUtcMonths(from, i);
            const prevD = addUtcMonths(prevFrom, i);
            const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
            const prevKey = `${prevD.getUTCFullYear()}-${String(prevD.getUTCMonth() + 1).padStart(2, "0")}`;
            const cur = byMonth.get(key) ?? { views: 0, visitors: 0 };
            const prev = byPrevMonth.get(prevKey) ?? { views: 0, visitors: 0 };
            return {
              date: key,
              label: MONTHS[d.getUTCMonth()],
              views: cur.views,
              visitors: cur.visitors,
              viewsPrev: prev.views,
              visitorsPrev: prev.visitors,
            };
          })
        : Array.from({ length: dayCount(from, to) }, (_, i) => {
            const d = addUtcDays(from, i);
            const prevD = addUtcDays(prevFrom, i);
            const key = d.toISOString().slice(0, 10);
            const prevKey = prevD.toISOString().slice(0, 10);
            const cur = byDay.get(key) ?? { views: 0, visitors: 0 };
            const prev = byPrevDay.get(prevKey) ?? { views: 0, visitors: 0 };
            return {
              date: key,
              label:
                grain === "week"
                  ? WEEKDAYS[d.getUTCDay()]
                  : `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`,
              views: cur.views,
              visitors: cur.visitors,
              viewsPrev: prev.views,
              visitorsPrev: prev.visitors,
            };
          });

  const hourly = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    views: byHour.get(hour)?.views ?? 0,
  }));

  const referrers = rank(referrerRows, (key) => key || "Direct / none");
  const channelMap = new Map<string, AnalyticsRankRow>();
  for (const row of referrers) {
    const channel = channelFromHost(row.key === "unknown" || !row.key ? null : row.key);
    const current = channelMap.get(channel) ?? {
      key: channel,
      label: channel,
      views: 0,
      visitors: 0,
    };
    current.views += row.views;
    current.visitors += row.visitors;
    channelMap.set(channel, current);
  }
  const channels = [...channelMap.values()].sort((a, b) => b.visitors - a.visitors);

  return {
    grain,
    offset,
    periodLabel: formatPeriodLabel(grain, from, to),
    compareLabel: formatPeriodLabel(grain, prevFrom, prevTo),
    from: from.toISOString(),
    to: to.toISOString(),
    realtime: n(realtimeRow[0]?.n),
    liveCountries: rank(liveCountryRows, countryLabel),
    users,
    usersPrev,
    pageviews,
    pageviewsPrev,
    sessions: currentSessions.sessions,
    sessionsPrev: prevSessions.sessions,
    bounceRate,
    bounceRatePrev,
    pagesPerSession,
    newUsers,
    returningUsers,
    timeseries,
    hourly,
    countries: rank(countryRows, countryLabel),
    cities: rank(cityRows, (key) => {
      const [city, code] = key.split(" · ");
      if (!code || code === "?") return city || "E panjohur";
      return `${city} · ${countryLabel(code)}`;
    }),
    pages: rank(pageRows, (key) => key || "/"),
    channels,
    referrers: referrers.map((row) => ({
      ...row,
      label: row.key && row.key !== "unknown" ? row.key : "Direct",
    })),
    devices: rank(deviceRows, (key) => DEVICE_LABEL[key] || key || "E panjohur"),
    browsers: rank(browserRows, (key) => key || "E panjohur"),
    os: rank(osRows, (key) => key || "E panjohur"),
    languages: rank(languageRows, (key) => key || "E panjohur"),
  };
}
