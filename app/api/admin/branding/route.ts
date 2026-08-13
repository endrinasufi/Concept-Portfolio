import { NextResponse } from "next/server";
import {
  isErrorResponse,
  jsonError,
  requireApiSession,
  revalidatePublicPaths,
} from "@/lib/server/api";
import { getServerProjectRepository } from "@/lib/repositories/server";

export async function GET(request: Request) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  const { searchParams } = new URL(request.url);
  const includeDrafts = searchParams.get("includeDrafts") !== "false";
  const items = await getServerProjectRepository().list({ includeDrafts });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  try {
    const body = await request.json();
    const created = await getServerProjectRepository().create(body);
    revalidatePublicPaths([`/branding/${created.slug}`]);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Create failed", 400);
  }
}
