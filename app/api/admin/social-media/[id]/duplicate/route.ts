import { NextResponse } from "next/server";
import {
  isErrorResponse,
  jsonError,
  requireApiSession,
  revalidatePublicPaths,
} from "@/lib/server/api";
import { getServerSocialMediaRepository } from "@/lib/repositories/server";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_r: Request, ctx: Ctx) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  const { id } = await ctx.params;
  try {
    const copy = await getServerSocialMediaRepository().duplicate(id);
    revalidatePublicPaths([`/social-media/${copy.slug}`]);
    return NextResponse.json(copy, { status: 201 });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Duplicate failed", 400);
  }
}
