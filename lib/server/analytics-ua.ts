export type ParsedUa = {
  device: "desktop" | "mobile" | "tablet";
  browser: string;
  os: string;
};

export function parseUserAgent(ua: string): ParsedUa {
  const u = ua || "";

  let device: ParsedUa["device"] = "desktop";
  if (/iPad|Tablet|PlayBook/i.test(u) || (/Android/i.test(u) && !/Mobile/i.test(u))) {
    device = "tablet";
  } else if (/Mobi|iPhone|iPod|Android.+Mobile|webOS|BlackBerry|IEMobile/i.test(u)) {
    device = "mobile";
  }

  let os = "Tjetër";
  if (/Windows NT/i.test(u)) os = "Windows";
  else if (/Android/i.test(u)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(u)) os = "iOS";
  else if (/Mac OS X|Macintosh/i.test(u)) os = "macOS";
  else if (/CrOS/i.test(u)) os = "ChromeOS";
  else if (/Linux/i.test(u)) os = "Linux";

  let browser = "Tjetër";
  if (/Edg\//i.test(u)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(u)) browser = "Opera";
  else if (/SamsungBrowser/i.test(u)) browser = "Samsung";
  else if (/Firefox\//i.test(u)) browser = "Firefox";
  else if (/Chrome\//i.test(u)) browser = "Chrome";
  else if (/Safari\//i.test(u)) browser = "Safari";

  return { device, browser, os };
}

export function parseReferrerHost(
  referrer: string | undefined,
  siteHost: string,
): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    const host = url.hostname.replace(/^www\./, "").slice(0, 255);
    const local = siteHost.replace(/^www\./, "").split(":")[0];
    if (!host || host === local) return null;
    return host;
  } catch {
    return null;
  }
}

export function channelFromHost(host: string | null | undefined): string {
  if (!host) return "Direct";
  if (/google\.|bing\.|yahoo\.|duckduckgo\.|baidu\./i.test(host)) return "Organic Search";
  if (
    /instagram\.|facebook\.|fb\.com|fbclid|tiktok\.|linkedin\.|twitter\.|t\.co$|x\.com|pinterest\.|youtube\.|whatsapp\.|threads\./i.test(
      host,
    )
  ) {
    return "Social";
  }
  return "Referral";
}
