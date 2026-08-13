import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession, type AdminUser } from "@/lib/server/auth";

export async function requireApiSession(): Promise<
  AdminUser | NextResponse
> {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}

export function isErrorResponse(
  value: AdminUser | NextResponse,
): value is NextResponse {
  return value instanceof NextResponse;
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
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
  ];
  for (const path of [...base, ...paths]) {
    revalidatePath(path);
  }
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
]);
