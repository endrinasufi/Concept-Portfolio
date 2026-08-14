import { query, type RowDataPacket } from "@/lib/server/db";
import {
  ensureAnalyticsTable,
  fmtSqlDate,
  n,
} from "@/lib/server/analytics";
import { channelFromHost } from "@/lib/server/analytics-ua";
import type {
  AnalyticsRangeKey,
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

export function parseRangeKey(raw: string | null): AnalyticsRangeKey {
  if (raw === "today" || raw === "7d" || raw === "28d" || raw === "90d") return raw;
  return "7d";
}

function rangeWindow(key: AnalyticsRangeKey): {
  from: Date;
  to: Date;
  prevFrom: Date;
  prevTo: Date;
  days: number;
} {
  const today = utcDayStart();
  const to = addUtcDays(today, 1);
  if (key === "today") {
    return {
      from: today,
      to,
      prevFrom: addUtcDays(today, -1),
      prevTo: today,
      days: 1,
    };
  }
  const days = key === "90d" ? 90 : key === "28d" ? 28 : 7;
  const from = addUtcDays(to, -days);
  return {
    from,
    to,
    prevFrom: addUtcDays(from, -days),
    prevTo: from,
    days,
  };
}

function labelForDay(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00.000Z`);
  if (days <= 7) return WEEKDAYS[d.getUTCDay()];
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
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
  rangeKey: AnalyticsRangeKey,
): Promise<AnalyticsReport> {
  await ensureAnalyticsTable();
  const { from, to, prevFrom, prevTo, days } = rangeWindow(rangeKey);
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
    dayRows,
    hourRows,
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
    query<DayRow[]>(
      `SELECT DATE(created_at) AS day,
              COUNT(*) AS views,
              COUNT(DISTINCT visitor_hash) AS visitors
       FROM page_views
       WHERE created_at >= :from AND created_at < :to
       GROUP BY DATE(created_at)
       ORDER BY day ASC`,
      bounds,
    ),
    query<HourRow[]>(
      `SELECT HOUR(created_at) AS hour, COUNT(*) AS views
       FROM page_views
       WHERE created_at >= :from AND created_at < :to
       GROUP BY HOUR(created_at)`,
      bounds,
    ),
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
  const timeseries = [];
  for (let i = 0; i < days; i++) {
    const d = addUtcDays(from, i);
    const key = d.toISOString().slice(0, 10);
    const found = byDay.get(key) ?? { views: 0, visitors: 0 };
    timeseries.push({
      date: key,
      label: labelForDay(key, days),
      views: found.views,
      visitors: found.visitors,
    });
  }

  const hourMap = new Map(hourRows.map((row) => [n(row.hour), n(row.views)]));
  const hourly = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    views: hourMap.get(hour) ?? 0,
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
    range: rangeKey,
    from: from.toISOString(),
    to: to.toISOString(),
    realtime: n(realtimeRow[0]?.n),
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
