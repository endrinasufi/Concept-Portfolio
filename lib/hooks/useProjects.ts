"use client";

import { useCallback, useEffect, useState } from "react";
import type { Project } from "@/types/branding";
import { getProjectRepository } from "@/lib/repositories";

export function useProjects(options?: { service?: string; includeDrafts?: boolean }) {
  const service = options?.service;
  const includeDrafts = options?.includeDrafts;
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
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
  }, [service, includeDrafts]);

  useEffect(() => {
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
  }, [service, includeDrafts]);

  return { projects, loading, error, refresh };
}

export function useProjectBySlug(slug: string, includeDrafts = false) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
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
  }, [slug, includeDrafts]);

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
