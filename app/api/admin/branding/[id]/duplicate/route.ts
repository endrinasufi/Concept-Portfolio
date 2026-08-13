import { NextResponse } from "next/server";
import {
  isErrorResponse,
  jsonError,
  requireApiSession,
  revalidatePublicPaths,
} from "@/lib/server/api";
import { getServerProjectRepository } from "@/lib/repositories/server";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, ctx: Ctx) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  const { id } = await ctx.params;
  try {
    const copy = await getServerProjectRepository().duplicate(id);
    revalidatePublicPaths([`/branding/${copy.slug}`]);
    return NextResponse.json(copy, { status: 201 });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Duplicate failed", 400);
  }
}
