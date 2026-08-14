import { NextResponse } from "next/server";
import { recordPageView } from "@/lib/server/analytics";

export async function POST(request: Request) {
  let body: { path?: string } = {};
  try {
    const text = await request.text();
    body = text ? (JSON.parse(text) as { path?: string }) : {};
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "";

  try {
    await recordPageView({
      path: body.path || "/",
      ip,
      userAgent,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[analytics]", err);
    return NextResponse.json({ ok: true });
  }
}
