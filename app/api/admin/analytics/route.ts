import { NextResponse } from "next/server";
import { isErrorResponse, requireApiAdmin } from "@/lib/server/api";
import { getAnalyticsSummary } from "@/lib/server/analytics";

export async function GET() {
  const session = await requireApiAdmin();
  if (isErrorResponse(session)) return session;
  try {
    const data = await getAnalyticsSummary();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[analytics summary]", err);
    return NextResponse.json(
      { error: "Could not load analytics. Check the MySQL connection." },
      { status: 500 },
    );
  }
}
