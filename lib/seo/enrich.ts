import {
  buildMetaDescription,
  buildMetaTitle,
  type SeoService,
} from "./metadata";

export type SeoFields = {
  metaTitle: string;
  metaDescription: string;
};

function hasText(value?: string | null): boolean {
  return Boolean(value && value.trim());
}

/** Template SEO — funksionon pa OpenAI. */
export function templateSeo(opts: {
  title: string;
  service: SeoService;
  client?: string;
  description?: string | null;
}): SeoFields {
  return {
    metaTitle: buildMetaTitle({
      title: opts.title,
      service: opts.service,
      client: opts.client,
    }),
    metaDescription: buildMetaDescription({
      description: opts.description,
      title: opts.title,
      service: opts.service,
      client: opts.client,
    }),
  };
}

async function openAiSeo(opts: {
  title: string;
  service: SeoService;
  client?: string;
  description?: string | null;
}): Promise<SeoFields | null> {
  const { getOpenaiSeoConfig } = await import("./openaiConfig");
  const { apiKey: key, model } = await getOpenaiSeoConfig();
  if (!key) return null;

  const prompt = `Write SEO for a Concept Marketing Albania portfolio.
Service: ${opts.service}
Title: ${opts.title}
Client: ${opts.client || "—"}
Description: ${opts.description || "—"}

Return clean JSON: {"metaTitle":"...","metaDescription":"..."}
Rules: metaTitle ≤ 60 characters, metaDescription ≤ 155, language English, no unnecessary quotes.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are an SEO specialist for a marketing portfolio. Return JSON only.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      metaTitle?: string;
      metaDescription?: string;
    };
    if (!parsed.metaTitle || !parsed.metaDescription) return null;
    return {
      metaTitle: parsed.metaTitle.trim().slice(0, 70),
      metaDescription: parsed.metaDescription.trim().slice(0, 170),
    };
  } catch {
    return null;
  }
}

/**
 * Plotëson SEO nëse mungon. OpenAI nëse ka key, përndryshe template.
 * force=true rivendos edhe kur fushat ekzistojnë (për cron javor).
 */
export async function resolveSeoFields(opts: {
  title: string;
  service: SeoService;
  client?: string;
  description?: string | null;
  existingTitle?: string | null;
  existingDescription?: string | null;
  force?: boolean;
}): Promise<SeoFields> {
  if (
    !opts.force &&
    hasText(opts.existingTitle) &&
    hasText(opts.existingDescription)
  ) {
    return {
      metaTitle: opts.existingTitle!.trim(),
      metaDescription: opts.existingDescription!.trim(),
    };
  }

  const ai = await openAiSeo(opts);
  if (ai) return ai;
  return templateSeo(opts);
}

/** Branding: metaTitle/metaDescription në root. */
export async function enrichBrandingSeo<T extends Record<string, unknown>>(
  body: T,
  opts?: { force?: boolean },
): Promise<T> {
  const title = String(body.title ?? "");
  if (!title.trim()) return body;
  const seo = await resolveSeoFields({
    title,
    service: "branding",
    client: typeof body.client === "string" ? body.client : undefined,
    description:
      typeof body.shortDescription === "string"
        ? body.shortDescription
        : typeof body.brandAbout === "string"
          ? body.brandAbout
          : undefined,
    existingTitle:
      typeof body.metaTitle === "string" ? body.metaTitle : undefined,
    existingDescription:
      typeof body.metaDescription === "string"
        ? body.metaDescription
        : undefined,
    force: opts?.force,
  });
  return {
    ...body,
    metaTitle: seo.metaTitle,
    metaDescription: seo.metaDescription,
  };
}

/** Social / Web: seo: { metaTitle, metaDescription } */
export async function enrichNestedSeo<T extends Record<string, unknown>>(
  body: T,
  service: Extract<SeoService, "social-media" | "web-design">,
  opts?: { force?: boolean },
): Promise<T> {
  const title = String(body.title ?? "");
  if (!title.trim()) return body;
  const existing =
    body.seo && typeof body.seo === "object"
      ? (body.seo as { metaTitle?: string; metaDescription?: string })
      : {};
  const client =
    typeof body.clientName === "string"
      ? body.clientName
      : typeof body.client === "string"
        ? body.client
        : undefined;
  const description =
    typeof body.description === "string"
      ? body.description
      : typeof body.shortDescription === "string"
        ? body.shortDescription
        : typeof body.serviceLabel === "string"
          ? body.serviceLabel
          : undefined;
  const seo = await resolveSeoFields({
    title,
    service,
    client,
    description,
    existingTitle: existing.metaTitle,
    existingDescription: existing.metaDescription,
    force: opts?.force,
  });
  return {
    ...body,
    seo: {
      ...existing,
      metaTitle: seo.metaTitle,
      metaDescription: seo.metaDescription,
    },
  };
}

export async function enrichPhotoshootingSeo<T extends Record<string, unknown>>(
  body: T,
  opts?: { force?: boolean },
): Promise<T> {
  const title = String(body.title ?? "");
  if (!title.trim()) return body;
  const seo = await resolveSeoFields({
    title,
    service: "photoshooting",
    client:
      typeof body.clientName === "string"
        ? body.clientName
        : typeof body.client === "string"
          ? body.client
          : undefined,
    description:
      typeof body.shortDescription === "string"
        ? body.shortDescription
        : typeof body.description === "string"
          ? body.description
          : undefined,
    existingTitle:
      typeof body.metaTitle === "string" ? body.metaTitle : undefined,
    existingDescription:
      typeof body.metaDescription === "string"
        ? body.metaDescription
        : undefined,
    force: opts?.force,
  });
  return {
    ...body,
    metaTitle: seo.metaTitle,
    metaDescription: seo.metaDescription,
  };
}
