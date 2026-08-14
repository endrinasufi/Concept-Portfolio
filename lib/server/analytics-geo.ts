export type GeoHit = {
  countryCode: string;
  city: string;
};

const cache = new Map<string, GeoHit>();
const CACHE_MAX = 2000;

function isPublicIp(ip: string): boolean {
  if (!ip || ip === "unknown") return false;
  if (ip === "::1" || ip.startsWith("127.") || ip.startsWith("10.")) return false;
  if (ip.startsWith("192.168.") || ip.startsWith("fe80:")) return false;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return false;
  return true;
}

function remember(ip: string, hit: GeoHit): GeoHit {
  if (cache.size >= CACHE_MAX) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
  cache.set(ip, hit);
  return hit;
}

function geoFromHeaders(headers: Headers): GeoHit | null {
  const code = (
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("cloudfront-viewer-country") ||
    headers.get("x-country-code") ||
    headers.get("x-geo-country") ||
    ""
  )
    .trim()
    .toUpperCase();
  if (!code || code.length !== 2 || code === "XX" || code === "T1") return null;

  const rawCity =
    headers.get("x-vercel-ip-city") ||
    headers.get("cf-ipcity") ||
    headers.get("x-geo-city") ||
    "";
  let city = "";
  try {
    city = decodeURIComponent(rawCity).slice(0, 80);
  } catch {
    city = rawCity.slice(0, 80);
  }
  return { countryCode: code, city };
}

async function lookupIp(ip: string): Promise<GeoHit | null> {
  const cached = cache.get(ip);
  if (cached) return cached;
  if (!isPublicIp(ip)) return null;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 700);
  try {
    const res = await fetch(
      `https://ipwho.is/${encodeURIComponent(ip)}?fields=success,country_code,city`,
      { signal: ctrl.signal, cache: "no-store" },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      success?: boolean;
      country_code?: string;
      city?: string;
    };
    if (!data.success || !data.country_code) return null;
    const code = data.country_code.trim().toUpperCase().slice(0, 2);
    if (code.length !== 2) return null;
    return remember(ip, {
      countryCode: code,
      city: (data.city || "").slice(0, 80),
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function resolveGeo(ip: string, headers: Headers): Promise<GeoHit | null> {
  return geoFromHeaders(headers) || lookupIp(ip);
}
