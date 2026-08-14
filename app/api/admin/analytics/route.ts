import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth";
import { getAnalyticsSummary } from "@/lib/server/analytics";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await getAnalyticsSummary();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[analytics summary]", err);
    return NextResponse.json(
      { error: "Analytics nuk u lexuan. Kontrollo lidhjen me MySQL." },
      { status: 500 },
    );
  }
}
