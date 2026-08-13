import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  getSessionUser,
  type AdminUser,
} from "./sessions";

export type { AdminUser };

export async function getSession(): Promise<AdminUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  return getSessionUser(token);
}

export async function requireSession(): Promise<AdminUser> {
  const user = await getSession();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
