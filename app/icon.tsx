import fs from "node:fs/promises";
import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import { loadSiteSettings } from "@/lib/server/publicData";
import { getServerMediaRepository } from "@/lib/repositories/server";
import { getLocalStorageProvider } from "@/lib/server/media";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

function defaultIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0b",
          color: "#d4a574",
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        C
      </div>
    ),
    { ...size },
  );
}

function iconResponse(body: BodyInit, mimeType?: string | null) {
  return new NextResponse(body, {
    headers: {
      "Content-Type": mimeType || "image/png",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}

export default async function Icon() {
  const settings = await loadSiteSettings();
  const id = settings.faviconMediaId;
  if (!id) return defaultIcon();

  try {
    const asset = await getServerMediaRepository().getById(id);
    if (asset?.provider === "cloudinary" && asset.publicUrl) {
      const res = await fetch(asset.publicUrl);
      if (res.ok) {
        return iconResponse(
          await res.arrayBuffer(),
          asset.mimeType || res.headers.get("content-type"),
        );
      }
    }
    if (asset?.providerKey && asset.provider !== "cloudinary") {
      const filePath = getLocalStorageProvider().resolvePath(asset.providerKey);
      const buf = await fs.readFile(filePath);
      return iconResponse(
        Uint8Array.from(buf) as unknown as BodyInit,
        asset.mimeType,
      );
    }
  } catch {
    /* fallback to default */
  }

  return defaultIcon();
}
