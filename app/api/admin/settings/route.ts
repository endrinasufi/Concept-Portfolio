import { NextResponse } from "next/server";
import {
  isErrorResponse,
  jsonError,
  requireApiSession,
  revalidatePublicPaths,
} from "@/lib/server/api";
import { getServerSettingsRepository } from "@/lib/repositories/server";
import { isAdminRole } from "@/lib/permissions";
import type { SiteSettings } from "@/types/settings";

export async function GET() {
  return NextResponse.json(await getServerSettingsRepository().get());
}

export async function PATCH(request: Request) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  try {
    const body = (await request.json()) as Partial<Omit<SiteSettings, "id">>;
    if (!isAdminRole(session.role)) {
      const keys = Object.keys(body);
      const allowed =
        keys.length > 0 &&
        keys.every((k) => k === "homeFeatured" || k.startsWith("footer"));
      if (!allowed) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    const updated = await getServerSettingsRepository().update(body);
    revalidatePublicPaths();
    return NextResponse.json(updated);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Update failed", 400);
  }
}
