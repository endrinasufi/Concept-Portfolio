import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/server/publicData";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/admin/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
