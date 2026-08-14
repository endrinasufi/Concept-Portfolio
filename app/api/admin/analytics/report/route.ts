import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth";
import {
  getAnalyticsReport,
  parseRangeKey,
} from "@/lib/server/analytics-report";

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const range = parseRangeKey(new URL(request.url).searchParams.get("range"));
  try {
    const data = await getAnalyticsReport(range);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[analytics report]", err);
    return NextResponse.json(
      { error: "Raporti nuk u lexua. Kontrollo lidhjen me MySQL." },
      { status: 500 },
    );
  }
}
