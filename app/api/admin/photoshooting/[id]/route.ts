import { NextResponse } from "next/server";
import {
  isErrorResponse,
  jsonError,
  requireApiSession,
  revalidatePublicPaths,
} from "@/lib/server/api";
import { getServerPhotoshootingRepository } from "@/lib/repositories/server";
import { enrichPhotoshootingSeo } from "@/lib/seo/enrich";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_r: Request, ctx: Ctx) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  const { id } = await ctx.params;
  const item = await getServerPhotoshootingRepository().getById(id);
  if (!item) return jsonError("Not found", 404);
  return NextResponse.json(item);
}

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  const { id } = await ctx.params;
  try {
    const existing = await getServerPhotoshootingRepository().getById(id);
    const patch = await request.json();
    const merged = await enrichPhotoshootingSeo({
      ...(existing ?? {}),
      ...patch,
    });
    const updated = await getServerPhotoshootingRepository().update(id, {
      ...patch,
      metaTitle: merged.metaTitle as string | undefined,
      metaDescription: merged.metaDescription as string | undefined,
    });
    revalidatePublicPaths([`/photoshooting/${updated.slug}`]);
    return NextResponse.json(updated);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Update failed", 400);
  }
}

export async function DELETE(_r: Request, ctx: Ctx) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  const { id } = await ctx.params;
  const existing = await getServerPhotoshootingRepository().getById(id);
  await getServerPhotoshootingRepository().delete(id);
  revalidatePublicPaths(
    existing ? [`/photoshooting/${existing.slug}`] : undefined,
  );
  return NextResponse.json({ ok: true });
}
