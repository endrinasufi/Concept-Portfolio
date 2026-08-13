export const SESSION_COOKIE = "cma_admin_session";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET is required in production");
    }
    return "dev-insecure-auth-secret";
  }
  return secret;
}
