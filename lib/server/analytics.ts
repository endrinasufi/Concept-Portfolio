import { createHash } from "node:crypto";
import { createId } from "@/lib/utils/id";
import { execute, query, type RowDataPacket } from "@/lib/server/db";
import { getAuthSecret } from "@/lib/server/auth/constants";
import { resolveGeo } from "@/lib/server/analytics-geo";
import {
  parseReferrerHost,
  parseUserAgent,
} from "@/lib/server/analytics-ua";

let tableReady = false;

const EXTRA_COLUMNS: { name: string; ddl: string }[] = [
  { name: "country_code", ddl: "VARCHAR(2) NULL" },
  { name: "city", ddl: "VARCHAR(80) NULL" },
  { name: "referrer_host", ddl: "VARCHAR(255) NULL" },
  { name: "device", ddl: "VARCHAR(16) NULL" },
  { name: "browser", ddl: "VARCHAR(40) NULL" },
  { name: "os", ddl: "VARCHAR(40) NULL" },
  { name: "language", ddl: "VARCHAR(16) NULL" },
];

export async function ensureAnalyticsTable(): Promise<void> {
  if (tableReady) return;
  await execute(`
    CREATE TABLE IF NOT EXISTS page_views (
      id VARCHAR(36) NOT NULL PRIMARY KEY,
      path VARCHAR(500) NOT NULL,
      visitor_hash CHAR(64) NOT NULL,
      created_at DATETIME(3) NOT NULL,
      country_code VARCHAR(2) NULL,
      city VARCHAR(80) NULL,
      referrer_host VARCHAR(255) NULL,
      device VARCHAR(16) NULL,
      browser VARCHAR(40) NULL,
      os VARCHAR(40) NULL,
      language VARCHAR(16) NULL,
      INDEX idx_views_created (created_at),
      INDEX idx_views_path (path(191)),
      INDEX idx_views_visitor_day (visitor_hash, created_at),
      INDEX idx_views_country (country_code),
      INDEX idx_views_device (device)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  const existing = await query<(RowDataPacket & { COLUMN_NAME: string })[]>(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'page_views'`,
  );
  const have = new Set(existing.map((row) => row.COLUMN_NAME));
  for (const col of EXTRA_COLUMNS) {
    if (have.has(col.name)) continue;
    try {
      await execute(`ALTER TABLE page_views ADD COLUMN ${col.name} ${col.ddl}`);
    } catch (err) {
      const code = (err as { errno?: number }).errno;
      if (code !== 1060) throw err;
    }
  }

  try {
    await execute("CREATE INDEX idx_views_country ON page_views (country_code)");
  } catch (err) {
    const code = (err as { errno?: number }).errno;
    if (code !== 1061) throw err;
  }
  try {
    await execute("CREATE INDEX idx_views_device ON page_views (device)");
  } catch (err) {
    const code = (err as { errno?: number }).errno;
    if (code !== 1061) throw err;
  }

  tableReady = true;
}

function normalizePath(raw: string): string | null {
  try {
    const path = raw.split("?")[0].split("#")[0];
    if (!path.startsWith("/")) return null;
    if (path.startsWith("/admin") || path.startsWith("/api") || path.startsWith("/_next")) {
      return null;
    }
    return path.slice(0, 500);
  } catch {
    return null;
  }
}

export function isBotUserAgent(ua: string): boolean {
  return /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram/i.test(
    ua,
  );
}

export function hashVisitor(ip: string, ua: string): string {
  return createHash("sha256")
    .update(`${ip}|${ua}|${getAuthSecret()}`)
    .digest("hex");
}

export async function recordPageView(opts: {
  path: string;
  ip: string;
  userAgent: string;
  referrer?: string;
  language?: string;
  headers: Headers;
  host?: string;
}): Promise<void> {
  const path = normalizePath(opts.path);
  if (!path) return;
  if (isBotUserAgent(opts.userAgent)) return;
  await ensureAnalyticsTable();

  const ua = parseUserAgent(opts.userAgent);
  const referrerHost = parseReferrerHost(opts.referrer, opts.host || "");
  const geo = await resolveGeo(opts.ip, opts.headers);
  const language = (opts.language || "").trim().slice(0, 16) || null;
  const now = new Date().toISOString().slice(0, 23).replace("T", " ");

  await execute(
    `INSERT INTO page_views (
       id, path, visitor_hash, created_at,
       country_code, city, referrer_host, device, browser, os, language
     ) VALUES (
       :id, :path, :visitor_hash, :created_at,
       :country_code, :city, :referrer_host, :device, :browser, :os, :language
     )`,
    {
      id: createId(),
      path,
      visitor_hash: hashVisitor(opts.ip || "unknown", opts.userAgent || ""),
      created_at: now,
      country_code: geo?.countryCode || null,
      city: geo?.city || null,
      referrer_host: referrerHost,
      device: ua.device,
      browser: ua.browser,
      os: ua.os,
      language,
    },
  );
}

interface CountRow extends RowDataPacket {
  n: number | string;
}

interface DayRow extends RowDataPacket {
  day: string;
  views: number | string;
  visitors: number | string;
}

interface PathRow extends RowDataPacket {
  path: string;
  views: number | string;
}

export function n(value: number | string | null | undefined): number {
  return Number(value ?? 0);
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function fmtSqlDate(d: Date): string {
  return d.toISOString().slice(0, 19).replace("T", " ");
}

export interface AnalyticsSummary {
  todayViews: number;
  todayVisitors: number;
  yesterdayViews: number;
  monthViews: number;
  monthVisitors: number;
  week: { label: string; date: string; views: number; visitors: number }[];
  topPages: { path: string; views: number }[];
}

const WEEKDAYS = ["Die", "Hën", "Mar", "Mër", "Enj", "Pre", "Sht"];

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  await ensureAnalyticsTable();

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setUTCDate(yesterdayStart.getUTCDate() - 1);
  const monthStart = new Date(
    Date.UTC(todayStart.getUTCFullYear(), todayStart.getUTCMonth(), 1),
  );
  const weekStart = new Date(todayStart);
  weekStart.setUTCDate(weekStart.getUTCDate() - 6);

  const [todayViews] = await query<CountRow[]>(
    `SELECT COUNT(*) AS n FROM page_views WHERE created_at >= :from`,
    { from: fmtSqlDate(todayStart) },
  );
  const [todayVisitors] = await query<CountRow[]>(
    `SELECT COUNT(DISTINCT visitor_hash) AS n FROM page_views WHERE created_at >= :from`,
    { from: fmtSqlDate(todayStart) },
  );
  const [yesterdayViews] = await query<CountRow[]>(
    `SELECT COUNT(*) AS n FROM page_views
     WHERE created_at >= :from AND created_at < :to`,
    { from: fmtSqlDate(yesterdayStart), to: fmtSqlDate(todayStart) },
  );
  const [monthViews] = await query<CountRow[]>(
    `SELECT COUNT(*) AS n FROM page_views WHERE created_at >= :from`,
    { from: fmtSqlDate(monthStart) },
  );
  const [monthVisitors] = await query<CountRow[]>(
    `SELECT COUNT(DISTINCT visitor_hash) AS n FROM page_views WHERE created_at >= :from`,
    { from: fmtSqlDate(monthStart) },
  );

  const weekRows = await query<DayRow[]>(
    `SELECT DATE(created_at) AS day,
            COUNT(*) AS views,
            COUNT(DISTINCT visitor_hash) AS visitors
     FROM page_views
     WHERE created_at >= :from
     GROUP BY DATE(created_at)
     ORDER BY day ASC`,
    { from: fmtSqlDate(weekStart) },
  );

  const byDay = new Map(
    weekRows.map((row) => [
      String(row.day).slice(0, 10),
      { views: n(row.views), visitors: n(row.visitors) },
    ]),
  );

  const week: AnalyticsSummary["week"] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStart);
    d.setUTCDate(d.getUTCDate() - i);
    const key = dayKey(d);
    const found = byDay.get(key) ?? { views: 0, visitors: 0 };
    week.push({
      label: WEEKDAYS[d.getUTCDay()],
      date: key,
      views: found.views,
      visitors: found.visitors,
    });
  }

  const topPages = (
    await query<PathRow[]>(
      `SELECT path, COUNT(*) AS views
       FROM page_views
       WHERE created_at >= :from
       GROUP BY path
       ORDER BY views DESC
       LIMIT 5`,
      { from: fmtSqlDate(monthStart) },
    )
  ).map((row) => ({ path: row.path, views: n(row.views) }));

  return {
    todayViews: n(todayViews?.n),
    todayVisitors: n(todayVisitors?.n),
    yesterdayViews: n(yesterdayViews?.n),
    monthViews: n(monthViews?.n),
    monthVisitors: n(monthVisitors?.n),
    week,
    topPages,
  };
}
