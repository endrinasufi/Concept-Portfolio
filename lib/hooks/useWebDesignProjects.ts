"use client";

import { useCallback, useEffect, useState } from "react";
import type { WebDesignProject } from "@/types/web-design";
import { getWebDesignProjectRepository } from "@/lib/repositories";

export function useWebDesignProjects(options?: { includeDrafts?: boolean }) {
  const includeDrafts = options?.includeDrafts;
  const [projects, setProjects] = useState<WebDesignProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const list = await getWebDesignProjectRepository().list({ includeDrafts });
      setProjects(list);
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
        const list = await getWebDesignProjectRepository().list({ includeDrafts });
        if (cancelled) return;
        setProjects(list);
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

  return { projects, loading, error, refresh };
}

export function useWebDesignProjectBySlug(slug: string, includeDrafts = false) {
  const [project, setProject] = useState<WebDesignProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [totalPublished, setTotalPublished] = useState(0);
  const [publishedIndex, setPublishedIndex] = useState(1);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    void (async () => {
      try {
        const repo = getWebDesignProjectRepository();
        const [result, published] = await Promise.all([
          repo.getBySlug(slug, { includeDrafts }),
          repo.list(),
        ]);
        if (cancelled) return;
        setTotalPublished(published.length);
        if (!result) {
          setNotFound(true);
          setProject(null);
        } else {
          setNotFound(false);
          setProject(result);
          const found = published.findIndex((p) => p.id === result.id);
          setPublishedIndex(found >= 0 ? found + 1 : result.order + 1);
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
  }, [slug, includeDrafts]);

  return { project, loading, error, notFound, totalPublished, publishedIndex };
}

export function useWebDesignProjectById(id: string) {
  const [project, setProject] = useState<WebDesignProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!id) return;
    try {
      const result = await getWebDesignProjectRepository().getById(id);
      setProject(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gabim");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void (async () => {
      try {
        const result = await getWebDesignProjectRepository().getById(id);
        if (cancelled) return;
        setProject(result);
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

  return { project, loading, error, refresh };
}
