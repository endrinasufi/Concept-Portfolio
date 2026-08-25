import { NextResponse } from "next/server";
import {
  isErrorResponse,
  jsonError,
  requireApiSession,
  revalidatePublicPaths,
} from "@/lib/server/api";
import { getServerSocialMediaRepository } from "@/lib/repositories/server";
import { enrichNestedSeo } from "@/lib/seo/enrich";

export async function GET(request: Request) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  const includeDrafts =
    new URL(request.url).searchParams.get("includeDrafts") !== "false";
  return NextResponse.json(
    await getServerSocialMediaRepository().list({ includeDrafts }),
  );
}

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (isErrorResponse(session)) return session;
  try {
    const body = await enrichNestedSeo(await request.json(), "social-media");
    const created = await getServerSocialMediaRepository().create(body);
    revalidatePublicPaths([`/social-media/${created.slug}`]);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Create failed", 400);
  }
}
