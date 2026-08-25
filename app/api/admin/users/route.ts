import { NextResponse } from "next/server";
import {
  isErrorResponse,
  jsonError,
  requireApiAdmin,
} from "@/lib/server/api";
import {
  createContentManager,
  listContentManagers,
} from "@/lib/server/auth/sessions";

export async function GET() {
  const session = await requireApiAdmin();
  if (isErrorResponse(session)) return session;
  return NextResponse.json({ users: await listContentManagers() });
}

export async function POST(request: Request) {
  const session = await requireApiAdmin();
  if (isErrorResponse(session)) return session;
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };
    const user = await createContentManager(
      body.email ?? "",
      body.password ?? "",
    );
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Create failed", 400);
  }
}
