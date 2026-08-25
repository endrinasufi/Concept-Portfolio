import { NextResponse } from "next/server";
import {
  isErrorResponse,
  jsonError,
  requireApiAdmin,
} from "@/lib/server/api";
import {
  deleteContentManager,
  resetContentManagerPassword,
} from "@/lib/server/auth/sessions";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, ctx: Ctx) {
  const session = await requireApiAdmin();
  if (isErrorResponse(session)) return session;
  const { id } = await ctx.params;
  try {
    await deleteContentManager(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Delete failed", 400);
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await requireApiAdmin();
  if (isErrorResponse(session)) return session;
  const { id } = await ctx.params;
  try {
    const body = (await request.json()) as { password?: string };
    await resetContentManagerPassword(id, body.password ?? "");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return jsonError(
      err instanceof Error ? err.message : "Update failed",
      400,
    );
  }
}
