import { getServerSettingsRepository } from "@/lib/repositories/server";

export type OpenaiSeoConfig = {
  apiKey: string | null;
  model: string;
};

/** Lexon OpenAI key nga settings (admin) ose env. */
export async function getOpenaiSeoConfig(): Promise<OpenaiSeoConfig> {
  try {
    const settings = await getServerSettingsRepository().get();
    const fromDb = settings.openaiApiKey?.trim();
    const fromEnv = process.env.OPENAI_API_KEY?.trim();
    const apiKey = fromDb || fromEnv || null;
    const model =
      settings.openaiSeoModel?.trim() ||
      process.env.OPENAI_SEO_MODEL?.trim() ||
      "gpt-4o-mini";
    return { apiKey, model };
  } catch {
    const apiKey = process.env.OPENAI_API_KEY?.trim() || null;
    return {
      apiKey,
      model: process.env.OPENAI_SEO_MODEL?.trim() || "gpt-4o-mini",
    };
  }
}

export async function hasOpenaiSeoKey(): Promise<boolean> {
  const { apiKey } = await getOpenaiSeoConfig();
  return Boolean(apiKey);
}
