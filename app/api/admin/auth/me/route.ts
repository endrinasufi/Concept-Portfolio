import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    email: user.email,
    id: user.id,
    role: user.role,
  });
}
