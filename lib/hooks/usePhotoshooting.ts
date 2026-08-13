"use client";

import { useCallback, useEffect, useState } from "react";
import type { PhotoshootingProject } from "@/types/photoshooting";
import { getPhotoshootingRepository } from "@/lib/repositories";

export function usePhotoshootingProjects(options?: {
  includeDrafts?: boolean;
  initial?: PhotoshootingProject[];
  enabled?: boolean;
}) {
  const includeDrafts = options?.includeDrafts;
  const enabled = options?.enabled !== false;
  const [projects, setProjects] = useState<PhotoshootingProject[]>(
    options?.initial ?? [],
  );
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const list = await getPhotoshootingRepository().list({ includeDrafts });
      setProjects(list);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gabim");
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
        const list = await getPhotoshootingRepository().list({ includeDrafts });
        if (cancelled) return;
        setProjects(list);
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
  }, [includeDrafts, enabled]);

  return { projects, loading, error, refresh };
}

export function usePhotoshootingBySlug(
  slug: string,
  includeDrafts = false,
  initial?: PhotoshootingProject | null,
) {
  const skip = initial !== undefined;
  const [project, setProject] = useState<PhotoshootingProject | null>(
    initial ?? null,
  );
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(skip ? !initial : false);

  useEffect(() => {
    if (skip || !slug) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const result = await getPhotoshootingRepository().getBySlug(slug, {
          includeDrafts,
        });
        if (cancelled) return;
        if (!result || (!includeDrafts && result.status !== "published")) {
          setNotFound(true);
          setProject(null);
        } else {
          setNotFound(false);
          setProject(result);
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

  return { project, loading, error, notFound };
}

export function usePhotoshootingById(id: string) {
  const [project, setProject] = useState<PhotoshootingProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void (async () => {
      try {
        const result = await getPhotoshootingRepository().getById(id);
        if (cancelled) return;
        if (!result) {
          setNotFound(true);
          setProject(null);
        } else {
          setNotFound(false);
          setProject(result);
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

  return { project, loading, error, notFound, setProject };
}
