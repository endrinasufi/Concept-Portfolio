export type AdminRole = "admin" | "content_manager";

/** Paths Content Manager cannot open (UI). */
export const CONTENT_MANAGER_BLOCKED_PREFIXES = [
  "/admin/settings",
  "/admin/analytics",
  "/admin/media",
] as const;

export function isAdminRole(role: AdminRole | string | undefined | null): boolean {
  return role === "admin";
}

export function isContentManagerRole(
  role: AdminRole | string | undefined | null,
): boolean {
  return role === "content_manager";
}

export function canAccessAdminPath(
  role: AdminRole | string | undefined | null,
  pathname: string,
): boolean {
  if (isAdminRole(role)) return true;
  if (!isContentManagerRole(role)) return false;
  return !CONTENT_MANAGER_BLOCKED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function navVisibleForRole(
  role: AdminRole | string | undefined | null,
  href: string,
): boolean {
  return canAccessAdminPath(role, href);
}
