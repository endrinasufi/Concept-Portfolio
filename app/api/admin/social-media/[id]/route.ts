import { NextResponse } from "next/server";
import {
  isErrorResponse,
  jsonError,
  requireApiSession,
  revalidatePublicPaths,
} from "@/lib/server/api";
import { getServerSocialMediaRepository } from "@/lib/repositories/server";
import { enrichNestedSeo } from "@/lib/seo/enrich";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_r: Request, ctx: Ctx) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  const { id } = await ctx.params;
  const item = await getServerSocialMediaRepository().getById(id);
  if (!item) return jsonError("Not found", 404);
  return NextResponse.json(item);
}

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  const { id } = await ctx.params;
  try {
    const existing = await getServerSocialMediaRepository().getById(id);
    const patch = await request.json();
    const merged = await enrichNestedSeo(
      { ...(existing ?? {}), ...patch },
      "social-media",
    );
    const updated = await getServerSocialMediaRepository().update(id, {
      ...patch,
      seo: merged.seo as { metaTitle?: string; metaDescription?: string },
    });
    revalidatePublicPaths([`/social-media/${updated.slug}`]);
    return NextResponse.json(updated);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Update failed", 400);
  }
}

export async function DELETE(_r: Request, ctx: Ctx) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  const { id } = await ctx.params;
  const existing = await getServerSocialMediaRepository().getById(id);
  await getServerSocialMediaRepository().delete(id);
  revalidatePublicPaths(
    existing ? [`/social-media/${existing.slug}`] : undefined,
  );
  return NextResponse.json({ ok: true });
}
