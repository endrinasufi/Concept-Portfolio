import { NextResponse } from "next/server";
import {
  isErrorResponse,
  jsonError,
  requireApiSession,
  revalidatePublicPaths,
} from "@/lib/server/api";
import { getServerProjectRepository } from "@/lib/repositories/server";
import { enrichBrandingSeo } from "@/lib/seo/enrich";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  const { id } = await ctx.params;
  const item = await getServerProjectRepository().getById(id);
  if (!item) return jsonError("Not found", 404);
  return NextResponse.json(item);
}

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  const { id } = await ctx.params;
  try {
    const existing = await getServerProjectRepository().getById(id);
    const patch = await request.json();
    const merged = await enrichBrandingSeo({
      ...(existing ?? {}),
      ...patch,
    });
    const updated = await getServerProjectRepository().update(id, {
      ...patch,
      metaTitle: merged.metaTitle as string | undefined,
      metaDescription: merged.metaDescription as string | undefined,
    });
    revalidatePublicPaths([`/branding/${updated.slug}`]);
    return NextResponse.json(updated);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Update failed", 400);
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  const { id } = await ctx.params;
  const existing = await getServerProjectRepository().getById(id);
  await getServerProjectRepository().delete(id);
  if (existing) revalidatePublicPaths([`/branding/${existing.slug}`]);
  else revalidatePublicPaths();
  return NextResponse.json({ ok: true });
}
