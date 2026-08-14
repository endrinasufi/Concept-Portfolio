import { NextResponse } from "next/server";
import { isErrorResponse, requireApiAdmin } from "@/lib/server/api";
import {
  getAnalyticsReport,
  parseGrain,
  parseOffset,
} from "@/lib/server/analytics-report";

export async function GET(request: Request) {
  const session = await requireApiAdmin();
  if (isErrorResponse(session)) return session;
  const url = new URL(request.url);
  const grain = parseGrain(url.searchParams.get("grain"));
  const offset = parseOffset(url.searchParams.get("offset"));
  try {
    const data = await getAnalyticsReport(grain, offset);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[analytics report]", err);
    return NextResponse.json(
      { error: "Raporti nuk u lexua. Kontrollo lidhjen me MySQL." },
      { status: 500 },
    );
  }
}
