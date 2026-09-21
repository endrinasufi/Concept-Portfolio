import { NextResponse } from "next/server";
import {
  ALLOWED_MIME,
  errorMessage,
  isErrorResponse,
  jsonError,
  requireApiSession,
  revalidatePublicPaths,
  sniffMimeType,
} from "@/lib/server/api";
import { getServerMediaRepository } from "@/lib/repositories/server";
import { query, type RowDataPacket } from "@/lib/server/db";

export async function GET() {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  return NextResponse.json(await getServerMediaRepository().list());
}

type JsonUploadBody = {
  fileBase64?: string;
  filename?: string;
  mimeType?: string;
  id?: string;
  width?: number;
  height?: number;
};

function fileFromBase64(body: JsonUploadBody): File | null {
  const raw = body.fileBase64?.trim();
  const filename = body.filename?.trim();
  if (!raw || !filename) return null;
  const comma = raw.indexOf(",");
  const b64 = raw.startsWith("data:") && comma >= 0 ? raw.slice(comma + 1) : raw;
  try {
    const buffer = Buffer.from(b64, "base64");
    if (!buffer.length) return null;
    const mime =
      sniffMimeType(filename, body.mimeType) ||
      "application/octet-stream";
    return new File([buffer], filename, { type: mime });
  } catch {
    return null;
  }
}

async function parseUploadFile(request: Request): Promise<{
  file: File;
  id?: string;
  width?: number;
  height?: number;
} | NextResponse> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    let body: JsonUploadBody;
    try {
      body = (await request.json()) as JsonUploadBody;
    } catch {
      return jsonError("Invalid JSON body");
    }
    const file = fileFromBase64(body);
    if (!file) return jsonError("fileBase64 and filename are required");
    return {
      file,
      id: body.id?.trim() || undefined,
      width: Number.isFinite(body.width) ? Number(body.width) : undefined,
      height: Number.isFinite(body.height) ? Number(body.height) : undefined,
    };
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return jsonError("file is required");
  const width = form.get("width") ? Number(form.get("width")) : undefined;
  const height = form.get("height") ? Number(form.get("height")) : undefined;
  return {
    file,
    id: String(form.get("id") || "") || undefined,
    width: Number.isFinite(width) ? width : undefined,
    height: Number.isFinite(height) ? height : undefined,
  };
}

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  try {
    const parsed = await parseUploadFile(request);
    if (parsed instanceof NextResponse) return parsed;
    const { file, id, width, height } = parsed;

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
    const created = await getServerMediaRepository().upload(file, {
      id,
      filename: file.name,
      width,
      height,
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
