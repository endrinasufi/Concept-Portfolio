"use client";

import { useCallback, useEffect, useState } from "react";
import type { VideoProductionItem } from "@/types/video-production";
import { getVideoProductionRepository } from "@/lib/repositories";

export function useVideoProduction(options?: { includeDrafts?: boolean }) {
  const includeDrafts = options?.includeDrafts;
  const [videos, setVideos] = useState<VideoProductionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const list = await getVideoProductionRepository().list({ includeDrafts });
      setVideos(list);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gabim në ngarkim");
    } finally {
      setLoading(false);
    }
  }, [includeDrafts]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await getVideoProductionRepository().list({ includeDrafts });
        if (cancelled) return;
        setVideos(list);
        setError(null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Gabim në ngarkim");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [includeDrafts]);

  return { videos, loading, error, refresh };
}

export function useVideoProductionById(id: string) {
  const [video, setVideo] = useState<VideoProductionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void (async () => {
      try {
        const result = await getVideoProductionRepository().getById(id);
        if (cancelled) return;
        if (!result) {
          setNotFound(true);
          setVideo(null);
        } else {
          setNotFound(false);
          setVideo(result);
        }
        setError(null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Gabim");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { video, loading, error, notFound, setVideo };
}
