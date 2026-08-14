import { NextResponse } from "next/server";
import { recordPageView } from "@/lib/server/analytics";

export async function POST(request: Request) {
  let body: { path?: string; referrer?: string; language?: string } = {};
  try {
    const text = await request.text();
    body = text
      ? (JSON.parse(text) as { path?: string; referrer?: string; language?: string })
      : {};
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "";
  const host = request.headers.get("host") || "";

  try {
    await recordPageView({
      path: body.path || "/",
      ip,
      userAgent,
      referrer: body.referrer,
      language: body.language,
      headers: request.headers,
      host,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[analytics]", err);
    return NextResponse.json({ ok: true });
  }
}
