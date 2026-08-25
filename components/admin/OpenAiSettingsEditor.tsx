"use client";

import { useEffect, useState } from "react";
import { useSiteSettings } from "@/lib/hooks/useSiteSettings";

export function OpenAiSettingsEditor() {
  const { settings, loading, update } = useSiteSettings();
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    setModel(settings.openaiSeoModel?.trim() || "gpt-4o-mini");
    if (settings.hasOpenaiApiKey && settings.openaiApiKeyMasked) {
      setApiKey(settings.openaiApiKeyMasked);
    }
  }, [
    loading,
    settings.hasOpenaiApiKey,
    settings.openaiApiKeyMasked,
    settings.openaiSeoModel,
  ]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const patch: {
        openaiApiKey?: string | null;
        openaiSeoModel?: string;
      } = {
        openaiSeoModel: model.trim() || "gpt-4o-mini",
      };
      const trimmed = apiKey.trim();
      if (!trimmed) {
        patch.openaiApiKey = null;
      } else if (!trimmed.includes("…")) {
        patch.openaiApiKey = trimmed;
      }
      const next = await update(patch);
      setMessage(
        next.hasOpenaiApiKey
          ? "OpenAI saved. Automatic SEO will use it."
          : "Key removed. SEO will use templates.",
      );
      if (next.openaiApiKeyMasked) setApiKey(next.openaiApiKeyMasked);
      else setApiKey("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function clearKey() {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      await update({ openaiApiKey: null });
      setApiKey("");
      setMessage("OpenAI key deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void save(e)}
      className="max-w-md space-y-2.5 rounded-2xl bg-white/70 p-4"
    >
      <h2 className="text-sm font-medium">OpenAI (SEO)</h2>
      <p className="text-xs text-muted">
        Set the API key here — it is stored in the database and used for
        automatic meta title/description. It is not exposed publicly.
      </p>
      <label className="block text-xs">
        <span className="text-muted">API key</span>
        <input
          type="password"
          autoComplete="off"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-…"
          className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm"
        />
      </label>
      <label className="block text-xs">
        <span className="text-muted">Model</span>
        <input
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="gpt-4o-mini"
          className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm"
        />
      </label>
      {settings.hasOpenaiApiKey ? (
        <p className="text-[11px] text-green-700">
          Key active
          {settings.openaiApiKeyMasked
            ? `: ${settings.openaiApiKeyMasked}`
            : ""}
        </p>
      ) : (
        <p className="text-[11px] text-muted">No key saved.</p>
      )}
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
      {message ? <p className="text-xs text-green-600">{message}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={busy || loading}
          className="rounded-full bg-foreground px-3 py-1.5 text-xs text-background disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save OpenAI"}
        </button>
        {settings.hasOpenaiApiKey ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void clearKey()}
            className="rounded-full border border-border px-3 py-1.5 text-xs disabled:opacity-60"
          >
            Remove key
          </button>
        ) : null}
      </div>
    </form>
  );
}
