import { NextResponse } from "next/server";
import {
  isErrorResponse,
  jsonError,
  requireApiSession,
} from "@/lib/server/api";
import {
  deleteContactEntry,
  listContactEntries,
  updateContactStatus,
  type ContactStatus,
} from "@/lib/server/contact";

export async function GET(request: Request) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as ContactStatus | null;
  const items = await listContactEntries(
    status === "new" || status === "read" || status === "archived"
      ? { status }
      : undefined,
  );
  return NextResponse.json(items);
}

export async function PATCH(request: Request) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  try {
    const body = (await request.json()) as {
      id?: string;
      status?: ContactStatus;
    };
    if (!body.id || !body.status) {
      return jsonError("id and status are required", 400);
    }
    if (!["new", "read", "archived"].includes(body.status)) {
      return jsonError("Invalid status", 400);
    }
    const updated = await updateContactStatus(body.id, body.status);
    if (!updated) return jsonError("Not found", 404);
    return NextResponse.json(updated);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Update failed", 400);
  }
}

export async function DELETE(request: Request) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return jsonError("id is required", 400);
  await deleteContactEntry(id);
  return NextResponse.json({ ok: true });
}
