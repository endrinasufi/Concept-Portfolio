import { NextResponse } from "next/server";
import {
  bootstrapAdminIfNeeded,
  createSession,
  findUserByEmail,
  SESSION_COOKIE,
  verifyPassword,
} from "@/lib/server/auth/sessions";
import { checkLoginRateLimit, resetLoginRateLimit } from "@/lib/server/auth/rateLimit";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const limit = checkLoginRateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${limit.retryAfterSec}s.` },
      { status: 429 },
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  try {
    await bootstrapAdminIfNeeded();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Bootstrap failed" },
      { status: 500 },
    );
  }

  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  resetLoginRateLimit(ip);
  const { token, expiresAt } = await createSession(user.id);
  const role =
    user.role === "content_manager" ? "content_manager" : "admin";
  const res = NextResponse.json({
    ok: true,
    email: user.email,
    role,
  });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  return res;
}
