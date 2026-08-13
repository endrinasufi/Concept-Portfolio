import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getServerMediaRepository } from "@/lib/repositories/server";
import { getLocalStorageProvider } from "@/lib/server/media";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const asset = await getServerMediaRepository().getById(id);
  if (!asset) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (asset.provider === "cloudinary" && asset.publicUrl) {
    return NextResponse.redirect(asset.publicUrl);
  }

  if (!asset.providerKey) {
    return NextResponse.json({ error: "Missing file" }, { status: 404 });
  }

  const filePath = getLocalStorageProvider().resolvePath(asset.providerKey);
  try {
    const buf = await fs.readFile(filePath);
    return new NextResponse(buf, {
      headers: {
        "Content-Type": asset.mimeType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": `inline; filename="${path.basename(asset.filename)}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }
}
