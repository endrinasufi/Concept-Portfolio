"use client";

import { useCallback, useEffect, useState } from "react";
import { getSettingsRepository } from "@/lib/repositories";
import type { SiteSettings } from "@/types/settings";
import { DEFAULT_SITE_SETTINGS } from "@/types/settings";

export function useSiteSettings(options?: {
  initial?: SiteSettings;
  enabled?: boolean;
}) {
  const enabled = options?.enabled !== false;
  const [settings, setSettings] = useState<SiteSettings>(
    options?.initial ?? DEFAULT_SITE_SETTINGS,
  );
  const [loading, setLoading] = useState(enabled);

  const refresh = useCallback(async () => {
    if (!enabled) return settings;
    const next = await getSettingsRepository().get();
    setSettings(next);
    return next;
  }, [enabled, settings]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const next = await getSettingsRepository().get();
        if (!cancelled) setSettings(next);
      } catch {
        /* public pages still render with defaults */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const update = useCallback(async (patch: Partial<Omit<SiteSettings, "id">>) => {
    const next = await getSettingsRepository().update(patch);
    setSettings(next);
    return next;
  }, []);

  return { settings, loading, update, refresh };
}
