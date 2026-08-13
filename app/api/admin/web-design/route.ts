import { NextResponse } from "next/server";
import {
  isErrorResponse,
  jsonError,
  requireApiSession,
  revalidatePublicPaths,
} from "@/lib/server/api";
import { getServerWebDesignRepository } from "@/lib/repositories/server";

export async function GET(request: Request) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  const includeDrafts =
    new URL(request.url).searchParams.get("includeDrafts") !== "false";
  return NextResponse.json(
    await getServerWebDesignRepository().list({ includeDrafts }),
  );
}

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  try {
    const created = await getServerWebDesignRepository().create(
      await request.json(),
    );
    revalidatePublicPaths([`/web-design/${created.slug}`]);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Create failed", 400);
  }
}
