import { NextResponse } from "next/server";
import { runWeeklySeoPass } from "@/lib/seo/weekly";
import { hasOpenaiSeoKey } from "@/lib/seo/openaiConfig";
import { revalidatePublicPaths } from "@/lib/server/api";

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const query = new URL(request.url).searchParams.get("secret") || "";
  return bearer === secret || query === secret;
}

async function handle(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const force =
    new URL(request.url).searchParams.get("force") === "1" ||
    new URL(request.url).searchParams.get("force") === "true";
  const result = await runWeeklySeoPass({ force });
  revalidatePublicPaths();
  return NextResponse.json({
    ok: true,
    ...result,
    usedOpenAi: await hasOpenaiSeoKey(),
  });
}

/** Cron javor: GET/POST /api/cron/seo-weekly?secret=... ose Authorization: Bearer */
export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
