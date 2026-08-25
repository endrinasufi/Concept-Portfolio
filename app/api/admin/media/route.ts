import { NextResponse } from "next/server";
import {
  ALLOWED_MIME,
  errorMessage,
  isErrorResponse,
  jsonError,
  requireApiAdmin,
  requireApiSession,
  revalidatePublicPaths,
  sniffMimeType,
} from "@/lib/server/api";
import { getServerMediaRepository } from "@/lib/repositories/server";
import { query, type RowDataPacket } from "@/lib/server/db";

export async function GET() {
  const session = await requireApiAdmin();
  if (isErrorResponse(session)) return session;
  return NextResponse.json(await getServerMediaRepository().list());
}

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return jsonError("file is required");
    if (file.size > 10 * 1024 * 1024) {
      return jsonError(
        "Image is over 10 MB (Cloudinary limit). Reduce the size or use JPG/WebP.",
      );
    }
    const mime = sniffMimeType(file.name, file.type);
    if (!ALLOWED_MIME.has(mime)) {
      return jsonError(
        `Format not allowed (${mime || file.type || "unknown"}). Use JPG, PNG, WebP, GIF, SVG, or ICO.`,
      );
    }
    const id = String(form.get("id") || "") || undefined;
    const width = form.get("width") ? Number(form.get("width")) : undefined;
    const height = form.get("height") ? Number(form.get("height")) : undefined;
    const created = await getServerMediaRepository().upload(file, {
      id,
      filename: file.name,
      width: Number.isFinite(width) ? width : undefined,
      height: Number.isFinite(height) ? height : undefined,
    });
    revalidatePublicPaths();
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("[media upload]", err);
    const raw = errorMessage(err, "Upload failed");
    if (/file size too large/i.test(raw)) {
      return jsonError(
        "Image is too large for Cloudinary (max 10 MB). Try again — it is now compressed automatically.",
        400,
      );
    }
    return jsonError(raw, 400);
  }
}

export async function DELETE(request: Request) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return jsonError("id required");

  const refs = await query<RowDataPacket[]>(
    `SELECT id FROM portfolio_items
     WHERE JSON_SEARCH(content_json, 'one', :id) IS NOT NULL
        OR JSON_SEARCH(CAST(meta_description AS JSON), 'one', :id) IS NOT NULL
     LIMIT 1`,
    { id },
  ).catch(() => [] as RowDataPacket[]);

  const settingsRefs = await query<RowDataPacket[]>(
    `SELECT id FROM site_settings
     WHERE JSON_SEARCH(data_json, 'one', :id) IS NOT NULL
     LIMIT 1`,
    { id },
  ).catch(() => [] as RowDataPacket[]);

  if (refs.length || settingsRefs.length) {
    return jsonError("Media is still referenced and cannot be deleted", 409);
  }

  await getServerMediaRepository().delete(id);
  revalidatePublicPaths();
  return NextResponse.json({ ok: true });
}
