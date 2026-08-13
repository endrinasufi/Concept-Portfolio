import { NextResponse } from "next/server";
import {
  isErrorResponse,
  jsonError,
  requireApiSession,
  revalidatePublicPaths,
} from "@/lib/server/api";
import { getServerSettingsRepository } from "@/lib/repositories/server";

export async function GET() {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  return NextResponse.json(await getServerSettingsRepository().get());
}

export async function PATCH(request: Request) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  try {
    const updated = await getServerSettingsRepository().update(
      await request.json(),
    );
    revalidatePublicPaths();
    return NextResponse.json(updated);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Update failed", 400);
  }
}
