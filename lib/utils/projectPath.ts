/** Public project URLs — encode slug so & / spaces / unicode don't break the path. */
export function publicProjectHref(
  service: "branding" | "social-media" | "web-design" | "photoshooting",
  slug: string,
  opts?: { preview?: boolean },
): string {
  const safe = encodeURIComponent(slug.trim());
  const path = `/${service}/${safe}`;
  return opts?.preview ? `${path}?preview=true` : path;
}

/** Normalize slug from the URL before DB lookup. */
export function normalizeRouteSlug(slug: string): string {
  try {
    return decodeURIComponent(slug).trim();
  } catch {
    return slug.trim();
  }
}
