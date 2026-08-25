import "server-only";

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession, type AdminUser } from "@/lib/server/auth";
import { isAdminRole } from "@/lib/permissions";

export async function requireApiSession(): Promise<
  AdminUser | NextResponse
> {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return user;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Auth/DB error";
    if (/ECONNREFUSED|ENOTFOUND|ER_ACCESS/i.test(msg)) {
      return NextResponse.json(
        {
          error:
            "MySQL nuk është i lidhur. Nise MySQL nga XAMPP, pastaj rifresko faqen.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function requireApiAdmin(): Promise<AdminUser | NextResponse> {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  if (!isAdminRole(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}

export function isErrorResponse(
  value: AdminUser | NextResponse,
): value is NextResponse {
  return value instanceof NextResponse;
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Cloudinary (and others) reject with a plain object, not `Error`. */
export function errorMessage(err: unknown, fallback = "Upload failed"): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err.trim()) return err;
  if (err && typeof err === "object") {
    const o = err as { message?: unknown; error?: unknown };
    if (typeof o.message === "string" && o.message.trim()) return o.message;
    if (typeof o.error === "string" && o.error.trim()) return o.error;
  }
  return fallback;
}

export function revalidatePublicPaths(paths: string[] = []) {
  const base = [
    "/",
    "/branding",
    "/social-media",
    "/web-design",
    "/photoshooting",
    "/video-production",
    "/video-production/social",
    "/video-production/production",
    "/icon",
  ];
  for (const path of [...base, ...paths]) {
    revalidatePath(path);
  }
}

export const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon",
  "image/ico",
  "image/heic",
  "image/heif",
  "video/mp4",
  "video/webm",
]);

/** When browsers send empty / octet-stream, infer from filename. */
export function sniffMimeType(filename: string, declared?: string): string {
  const declaredOk =
    declared &&
    declared !== "application/octet-stream" &&
    declared !== "binary/octet-stream"
      ? declared
      : "";
  if (declaredOk && ALLOWED_MIME.has(declaredOk)) return declaredOk;

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const byExt: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
            ico: "image/x-icon",
            heic: "image/heic",
            heif: "image/heif",
            jfif: "image/jpeg",
    mp4: "video/mp4",
    webm: "video/webm",
  };
  return byExt[ext] || declaredOk || declared || "application/octet-stream";
}
