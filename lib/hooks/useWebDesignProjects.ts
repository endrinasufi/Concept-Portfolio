"use client";

import { useCallback, useEffect, useState } from "react";
import type { WebDesignProject } from "@/types/web-design";
import { getWebDesignProjectRepository } from "@/lib/repositories";

export function useWebDesignProjects(options?: {
  includeDrafts?: boolean;
  initial?: WebDesignProject[];
  enabled?: boolean;
}) {
  const includeDrafts = options?.includeDrafts;
  const enabled = options?.enabled !== false;
  const [projects, setProjects] = useState<WebDesignProject[]>(
    options?.initial ?? [],
  );
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const list = await getWebDesignProjectRepository().list({ includeDrafts });
      setProjects(list);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gabim në ngarkim");
    } finally {
      setLoading(false);
    }
  }, [includeDrafts, enabled]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
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
  }, [includeDrafts, enabled]);

  return { projects, loading, error, refresh };
}

export function useWebDesignProjectBySlug(
  slug: string,
  includeDrafts = false,
  initial?: WebDesignProject | null,
  initialPublished?: WebDesignProject[],
) {
  const skip = initial !== undefined;
  const [project, setProject] = useState<WebDesignProject | null>(initial ?? null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(skip ? !initial : false);
  const [totalPublished, setTotalPublished] = useState(
    initialPublished?.length ?? 0,
  );
  const [publishedIndex, setPublishedIndex] = useState(() => {
    if (!initial || !initialPublished) return 1;
    const found = initialPublished.findIndex((p) => p.id === initial.id);
    return found >= 0 ? found + 1 : initial.order + 1;
  });

  useEffect(() => {
    if (skip || !slug) {
      setLoading(false);
      return;
    }
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
  }, [slug, includeDrafts, skip]);

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
