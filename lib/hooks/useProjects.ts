"use client";

import { useCallback, useEffect, useState } from "react";
import type { Project } from "@/types/branding";
import { getProjectRepository } from "@/lib/repositories";

export function useProjects(options?: {
  service?: string;
  includeDrafts?: boolean;
  initial?: Project[];
  enabled?: boolean;
}) {
  const service = options?.service;
  const includeDrafts = options?.includeDrafts;
  const enabled = options?.enabled !== false;
  const [projects, setProjects] = useState<Project[]>(options?.initial ?? []);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const repo = getProjectRepository();
      const list = await repo.list({ service, includeDrafts });
      setProjects(list);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gabim në ngarkim");
    } finally {
      setLoading(false);
    }
  }, [service, includeDrafts, enabled]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const repo = getProjectRepository();
        const list = await repo.list({ service, includeDrafts });
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
  }, [service, includeDrafts, enabled]);

  return { projects, loading, error, refresh };
}

export function useProjectBySlug(
  slug: string,
  includeDrafts = false,
  initial?: Project | null,
) {
  const skip = initial !== undefined;
  const [project, setProject] = useState<Project | null>(initial ?? null);
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
        const repo = getProjectRepository();
        const result = await repo.getBySlug(slug, { includeDrafts });
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
  }, [slug, includeDrafts, skip]);

  return { project, loading, error, notFound };
}

export function useProjectById(id: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!id) return;
    try {
      const repo = getProjectRepository();
      const result = await repo.getById(id);
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
        const repo = getProjectRepository();
        const result = await repo.getById(id);
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

  return { project, loading, error, refresh, setProject };
}
