import { NextResponse } from "next/server";
import {
  isErrorResponse,
  jsonError,
  requireApiSession,
  revalidatePublicPaths,
} from "@/lib/server/api";
import { getServerSettingsRepository } from "@/lib/repositories/server";
import { getSession } from "@/lib/server/auth";
import { isAdminRole } from "@/lib/permissions";
import {
  sanitizeSettingsForAdmin,
  sanitizeSettingsForPublic,
  type SiteSettings,
} from "@/types/settings";

export async function GET() {
  const settings = await getServerSettingsRepository().get();
  const session = await getSession();
  if (session && isAdminRole(session.role)) {
    return NextResponse.json(sanitizeSettingsForAdmin(settings));
  }
  return NextResponse.json(sanitizeSettingsForPublic(settings));
}

export async function PATCH(request: Request) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  try {
    const body = (await request.json()) as Partial<Omit<SiteSettings, "id">> & {
      openaiApiKey?: string | null;
      openaiSeoModel?: string | null;
      smtpPass?: string | null;
    };

    if (!isAdminRole(session.role)) {
      const keys = Object.keys(body);
      if (keys.length === 0 || keys.some((k) => k !== "homeFeatured")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const patch: Partial<Omit<SiteSettings, "id">> = { ...body };

    if ("openaiApiKey" in body) {
      if (!isAdminRole(session.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const raw = body.openaiApiKey;
      if (raw === null || raw === "" || raw === undefined) {
        patch.openaiApiKey = undefined;
      } else if (typeof raw === "string" && raw.includes("…")) {
        delete patch.openaiApiKey;
      } else if (typeof raw === "string") {
        patch.openaiApiKey = raw.trim();
      }
    }

    if ("openaiSeoModel" in body) {
      if (!isAdminRole(session.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const model = body.openaiSeoModel;
      if (model === null || model === "") {
        patch.openaiSeoModel = undefined;
      } else if (typeof model === "string") {
        patch.openaiSeoModel = model.trim();
      }
    }

    if ("smtpPass" in body) {
      if (!isAdminRole(session.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const raw = body.smtpPass;
      if (raw === null || raw === "" || raw === undefined) {
        patch.smtpPass = undefined;
      } else if (typeof raw === "string" && raw.includes("…")) {
        delete patch.smtpPass;
      } else if (typeof raw === "string") {
        patch.smtpPass = raw.trim();
      }
    }

    const updated = await getServerSettingsRepository().update(patch);
    revalidatePublicPaths();
    return NextResponse.json(
      isAdminRole(session.role)
        ? sanitizeSettingsForAdmin(updated)
        : sanitizeSettingsForPublic(updated),
    );
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Update failed", 400);
  }
}
