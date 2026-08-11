"use client";

import { useCallback, useEffect, useState } from "react";
import { getSettingsRepository } from "@/lib/repositories/local/LocalSettingsRepository";
import type { SiteSettings } from "@/types/settings";
import { DEFAULT_SITE_SETTINGS } from "@/types/settings";

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await getSettingsRepository().get();
    setSettings(next);
    return next;
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const next = await getSettingsRepository().get();
        if (!cancelled) setSettings(next);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback(async (patch: Partial<Omit<SiteSettings, "id">>) => {
    const next = await getSettingsRepository().update(patch);
    setSettings(next);
    return next;
  }, []);

  return { settings, loading, update, refresh };
}
