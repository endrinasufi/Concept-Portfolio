"use client";

import { useCallback, useEffect, useState } from "react";
import type { SocialMediaProject } from "@/types/social-media";
import { getSocialMediaProjectRepository } from "@/lib/repositories";

export function useSocialMediaProjects(options?: { includeDrafts?: boolean }) {
  const includeDrafts = options?.includeDrafts;
  const [projects, setProjects] = useState<SocialMediaProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const list = await getSocialMediaProjectRepository().list({ includeDrafts });
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
        const list = await getSocialMediaProjectRepository().list({ includeDrafts });
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

export function useSocialMediaProjectBySlug(
  slug: string,
  includeDrafts = false,
  initial?: SocialMediaProject | null,
) {
  const skip = initial !== undefined;
  const [project, setProject] = useState<SocialMediaProject | null>(
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
        const result = await getSocialMediaProjectRepository().getBySlug(slug, {
          includeDrafts,
        });
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

export function useSocialMediaProjectById(id: string) {
  const [project, setProject] = useState<SocialMediaProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!id) return;
    try {
      const result = await getSocialMediaProjectRepository().getById(id);
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
        const result = await getSocialMediaProjectRepository().getById(id);
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
