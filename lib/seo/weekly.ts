import {
  getServerPhotoshootingRepository,
  getServerProjectRepository,
  getServerSocialMediaRepository,
  getServerWebDesignRepository,
} from "@/lib/repositories/server";
import {
  enrichBrandingSeo,
  enrichNestedSeo,
  enrichPhotoshootingSeo,
} from "./enrich";

export type SeoWeeklyResult = {
  scanned: number;
  updated: number;
  skipped: number;
  errors: string[];
};

function needsSeo(metaTitle?: string | null, metaDescription?: string | null) {
  return !metaTitle?.trim() || !metaDescription?.trim();
}

/**
 * Skanon projektet dhe plotëson SEO që mungon.
 * Thirret nga cron javor ose manualisht nga admin.
 */
export async function runWeeklySeoPass(opts?: {
  force?: boolean;
}): Promise<SeoWeeklyResult> {
  const force = Boolean(opts?.force);
  const result: SeoWeeklyResult = {
    scanned: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  const branding = await getServerProjectRepository().list({
    includeDrafts: true,
  });
  for (const p of branding) {
    result.scanned += 1;
    if (!force && !needsSeo(p.metaTitle, p.metaDescription)) {
      result.skipped += 1;
      continue;
    }
    try {
      const enriched = await enrichBrandingSeo(
        p as unknown as Record<string, unknown>,
        { force },
      );
      await getServerProjectRepository().update(p.id, {
        metaTitle: enriched.metaTitle as string,
        metaDescription: enriched.metaDescription as string,
      });
      result.updated += 1;
    } catch (err) {
      result.errors.push(
        `branding:${p.id}: ${err instanceof Error ? err.message : "error"}`,
      );
    }
  }

  const social = await getServerSocialMediaRepository().list({
    includeDrafts: true,
  });
  for (const p of social) {
    result.scanned += 1;
    if (!force && !needsSeo(p.seo?.metaTitle, p.seo?.metaDescription)) {
      result.skipped += 1;
      continue;
    }
    try {
      const enriched = await enrichNestedSeo(
        p as unknown as Record<string, unknown>,
        "social-media",
        { force },
      );
      await getServerSocialMediaRepository().update(p.id, {
        seo: enriched.seo as { metaTitle?: string; metaDescription?: string },
      });
      result.updated += 1;
    } catch (err) {
      result.errors.push(
        `social:${p.id}: ${err instanceof Error ? err.message : "error"}`,
      );
    }
  }

  const web = await getServerWebDesignRepository().list({
    includeDrafts: true,
  });
  for (const p of web) {
    result.scanned += 1;
    if (!force && !needsSeo(p.seo?.metaTitle, p.seo?.metaDescription)) {
      result.skipped += 1;
      continue;
    }
    try {
      const enriched = await enrichNestedSeo(
        p as unknown as Record<string, unknown>,
        "web-design",
        { force },
      );
      await getServerWebDesignRepository().update(p.id, {
        seo: enriched.seo as { metaTitle?: string; metaDescription?: string },
      });
      result.updated += 1;
    } catch (err) {
      result.errors.push(
        `web:${p.id}: ${err instanceof Error ? err.message : "error"}`,
      );
    }
  }

  const photo = await getServerPhotoshootingRepository().list({
    includeDrafts: true,
  });
  for (const p of photo) {
    result.scanned += 1;
    if (!force && !needsSeo(p.metaTitle, p.metaDescription)) {
      result.skipped += 1;
      continue;
    }
    try {
      const enriched = await enrichPhotoshootingSeo(
        p as unknown as Record<string, unknown>,
        { force },
      );
      await getServerPhotoshootingRepository().update(p.id, {
        metaTitle: enriched.metaTitle as string,
        metaDescription: enriched.metaDescription as string,
      });
      result.updated += 1;
    } catch (err) {
      result.errors.push(
        `photo:${p.id}: ${err instanceof Error ? err.message : "error"}`,
      );
    }
  }

  return result;
}
