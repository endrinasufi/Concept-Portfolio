import { NextResponse } from "next/server";
import {
  isErrorResponse,
  jsonError,
  requireApiAdmin,
  revalidatePublicPaths,
} from "@/lib/server/api";
import { runWeeklySeoPass } from "@/lib/seo/weekly";
import { hasOpenaiSeoKey } from "@/lib/seo/openaiConfig";

/** Admin manual: nis SEO pass tani. */
export async function POST(request: Request) {
  const session = await requireApiAdmin();
  if (isErrorResponse(session)) return session;
  try {
    const body = (await request.json().catch(() => ({}))) as {
      force?: boolean;
    };
    const result = await runWeeklySeoPass({ force: Boolean(body.force) });
    revalidatePublicPaths();
    return NextResponse.json({
      ok: true,
      ...result,
      usedOpenAi: await hasOpenaiSeoKey(),
    });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "SEO pass failed", 500);
  }
}
