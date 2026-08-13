import { NextResponse } from "next/server";
import {
  isErrorResponse,
  jsonError,
  requireApiSession,
  revalidatePublicPaths,
} from "@/lib/server/api";
import { getServerProjectRepository } from "@/lib/repositories/server";

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  try {
    const body = (await request.json()) as { orderedIds?: string[] };
    if (!Array.isArray(body.orderedIds)) {
      return jsonError("orderedIds required");
    }
    await getServerProjectRepository().reorder(body.orderedIds);
    revalidatePublicPaths();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Reorder failed", 400);
  }
}
