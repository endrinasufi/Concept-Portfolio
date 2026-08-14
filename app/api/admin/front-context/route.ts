import { NextResponse } from "next/server";
import {
  isErrorResponse,
  requireApiSession,
} from "@/lib/server/api";
import { isAdminRole, type AdminRole } from "@/lib/permissions";
import {
  getServerPhotoshootingRepository,
  getServerProjectRepository,
  getServerSocialMediaRepository,
  getServerWebDesignRepository,
} from "@/lib/repositories/server";

export type FrontContextResponse = {
  role: AdminRole;
  email: string;
  editHref: string | null;
  editLabel: string | null;
};

async function resolveEditHref(
  pathname: string,
): Promise<{ href: string; label: string } | null> {
  const path = pathname.split("?")[0].replace(/\/$/, "") || "/";
  const parts = path.split("/").filter(Boolean);
  if (parts.length < 2) return null;

  const [section, slug] = parts;
  const opts = { includeDrafts: true as const };

  try {
    if (section === "branding" && slug) {
      const project = await getServerProjectRepository().getBySlug(slug, opts);
      if (project) {
        return {
          href: `/admin/branding/${project.id}`,
          label: "Edito projektin",
        };
      }
    }
    if (section === "social-media" && slug) {
      const project = await getServerSocialMediaRepository().getBySlug(
        slug,
        opts,
      );
      if (project) {
        return {
          href: `/admin/social-media/${project.id}`,
          label: "Edito projektin",
        };
      }
    }
    if (section === "web-design" && slug) {
      const project = await getServerWebDesignRepository().getBySlug(slug, opts);
      if (project) {
        return {
          href: `/admin/web-design/${project.id}`,
          label: "Edito projektin",
        };
      }
    }
    if (section === "photoshooting" && slug) {
      const project = await getServerPhotoshootingRepository().getBySlug(
        slug,
        opts,
      );
      if (project) {
        return {
          href: `/admin/photoshooting/${project.id}`,
          label: "Edito projektin",
        };
      }
    }
  } catch {
    return null;
  }
  return null;
}

export async function GET(request: Request) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const path = new URL(request.url).searchParams.get("path") || "/";
  const edit = await resolveEditHref(path);

  const body: FrontContextResponse = {
    role: isAdminRole(session.role) ? "admin" : "content_manager",
    email: session.email,
    editHref: edit?.href ?? null,
    editLabel: edit?.label ?? null,
  };
  return NextResponse.json(body);
}
