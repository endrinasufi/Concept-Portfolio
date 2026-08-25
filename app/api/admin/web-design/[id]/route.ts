import { NextResponse } from "next/server";
import {
  isErrorResponse,
  jsonError,
  requireApiSession,
  revalidatePublicPaths,
} from "@/lib/server/api";
import { getServerWebDesignRepository } from "@/lib/repositories/server";
import { enrichNestedSeo } from "@/lib/seo/enrich";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_r: Request, ctx: Ctx) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  const { id } = await ctx.params;
  const item = await getServerWebDesignRepository().getById(id);
  if (!item) return jsonError("Not found", 404);
  return NextResponse.json(item);
}

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  const { id } = await ctx.params;
  try {
    const existing = await getServerWebDesignRepository().getById(id);
    const patch = await request.json();
    const merged = await enrichNestedSeo(
      { ...(existing ?? {}), ...patch },
      "web-design",
    );
    const updated = await getServerWebDesignRepository().update(id, {
      ...patch,
      seo: merged.seo as { metaTitle?: string; metaDescription?: string },
    });
    revalidatePublicPaths([`/web-design/${updated.slug}`]);
    return NextResponse.json(updated);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Update failed", 400);
  }
}

export async function DELETE(_r: Request, ctx: Ctx) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  const { id } = await ctx.params;
  const existing = await getServerWebDesignRepository().getById(id);
  await getServerWebDesignRepository().delete(id);
  revalidatePublicPaths(existing ? [`/web-design/${existing.slug}`] : undefined);
  return NextResponse.json({ ok: true });
}
