import type { AdminRole } from "@/lib/permissions";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { createId, nowIso } from "@/lib/utils/id";
import { execute, query, type RowDataPacket } from "@/lib/server/db";
import { SESSION_COOKIE, SESSION_TTL_MS, getAuthSecret } from "./constants";

export type { AdminRole };

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
}

interface UserRow extends RowDataPacket {
  id: string;
  email: string;
  password_hash: string;
  role?: string;
}

interface SessionRow extends RowDataPacket {
  id: string;
  user_id: string;
  email: string;
  role?: string;
  expires_at: Date | string;
}

let roleColumnReady = false;

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function hashToken(token: string): string {
  return createHash("sha256")
    .update(`${token}:${getAuthSecret()}`)
    .digest("hex");
}

export function createSessionToken(): string {
  return randomBytes(32).toString("hex");
}

function normalizeRole(raw: unknown): AdminRole {
  return raw === "content_manager" ? "content_manager" : "admin";
}

export async function ensureAdminRoleColumn(): Promise<void> {
  if (roleColumnReady) return;
  const existing = await query<(RowDataPacket & { COLUMN_NAME: string })[]>(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admin_users'
       AND COLUMN_NAME = 'role'`,
  );
  if (!existing.length) {
    try {
      await execute(
        `ALTER TABLE admin_users
         ADD COLUMN role ENUM('admin', 'content_manager') NOT NULL DEFAULT 'admin'
         AFTER email`,
      );
    } catch (err) {
      const code = (err as { errno?: number }).errno;
      if (code !== 1060) throw err;
    }
  }
  roleColumnReady = true;
}

export async function countAdminUsers(): Promise<number> {
  await ensureAdminRoleColumn();
  const rows = await query<RowDataPacket[]>(
    "SELECT COUNT(*) AS c FROM admin_users",
  );
  return Number(rows[0]?.c ?? 0);
}

export async function bootstrapAdminIfNeeded(): Promise<void> {
  await ensureAdminRoleColumn();
  const count = await countAdminUsers();
  if (count > 0) return;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "No admin users exist. Set ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD to bootstrap.",
    );
  }
  const stamp = nowIso();
  await execute(
    `INSERT INTO admin_users (id, email, role, password_hash, created_at, updated_at)
     VALUES (:id, :email, 'admin', :password_hash, :created_at, :updated_at)`,
    {
      id: createId(),
      email,
      password_hash: hashPassword(password),
      created_at: stamp,
      updated_at: stamp,
    },
  );
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  await ensureAdminRoleColumn();
  const rows = await query<UserRow[]>(
    "SELECT id, email, password_hash, role FROM admin_users WHERE email = :email LIMIT 1",
    { email: email.trim().toLowerCase() },
  );
  return rows[0] ?? null;
}

export async function createSession(userId: string): Promise<{
  token: string;
  expiresAt: Date;
}> {
  const token = createSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const stamp = nowIso();
  await execute(
    `INSERT INTO admin_sessions (id, user_id, token_hash, expires_at, created_at)
     VALUES (:id, :user_id, :token_hash, :expires_at, :created_at)`,
    {
      id: createId(),
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString().slice(0, 23).replace("T", " "),
      created_at: stamp.slice(0, 23).replace("T", " "),
    },
  );
  return { token, expiresAt };
}

export async function deleteSessionByToken(token: string): Promise<void> {
  if (!token) return;
  await execute("DELETE FROM admin_sessions WHERE token_hash = :token_hash", {
    token_hash: hashToken(token),
  });
}

export async function getSessionUser(
  token: string | undefined | null,
): Promise<AdminUser | null> {
  if (!token) return null;
  await ensureAdminRoleColumn();
  const rows = await query<SessionRow[]>(
    `SELECT s.id, s.user_id, s.expires_at, u.email, u.role
     FROM admin_sessions s
     INNER JOIN admin_users u ON u.id = s.user_id
     WHERE s.token_hash = :token_hash
     LIMIT 1`,
    { token_hash: hashToken(token) },
  );
  const row = rows[0];
  if (!row) return null;
  const expires =
    row.expires_at instanceof Date
      ? row.expires_at
      : new Date(String(row.expires_at).replace(" ", "T") + "Z");
  if (Number.isNaN(expires.getTime()) || expires.getTime() < Date.now()) {
    await execute("DELETE FROM admin_sessions WHERE id = :id", { id: row.id });
    return null;
  }
  return {
    id: row.user_id,
    email: row.email,
    role: normalizeRole(row.role),
  };
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await ensureAdminRoleColumn();
  const rows = await query<UserRow[]>(
    "SELECT id, email, password_hash, role FROM admin_users WHERE id = :id LIMIT 1",
    { id: userId },
  );
  const user = rows[0];
  if (!user) throw new Error("User not found");
  if (!verifyPassword(currentPassword, user.password_hash)) {
    throw new Error("Current password is incorrect");
  }
  if (newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters");
  }
  await execute(
    "UPDATE admin_users SET password_hash = :password_hash, updated_at = :updated_at WHERE id = :id",
    {
      id: userId,
      password_hash: hashPassword(newPassword),
      updated_at: nowIso().slice(0, 23).replace("T", " "),
    },
  );
}

export type ManagedUser = {
  id: string;
  email: string;
  role: AdminRole;
  createdAt: string;
};

export async function listContentManagers(): Promise<ManagedUser[]> {
  await ensureAdminRoleColumn();
  const rows = await query<
    (RowDataPacket & {
      id: string;
      email: string;
      role: string;
      created_at: Date | string;
    })[]
  >(
    `SELECT id, email, role, created_at FROM admin_users
     WHERE role = 'content_manager'
     ORDER BY created_at DESC`,
  );
  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    role: "content_manager" as const,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  }));
}

export async function createContentManager(
  emailRaw: string,
  password: string,
): Promise<ManagedUser> {
  await ensureAdminRoleColumn();
  const email = emailRaw.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error("Email i pavlefshëm");
  }
  if (password.length < 8) {
    throw new Error("Fjalëkalimi duhet të ketë të paktën 8 karaktere");
  }
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error("Ky email është tashmë i regjistruar");
  }
  const id = createId();
  const stamp = nowIso();
  await execute(
    `INSERT INTO admin_users (id, email, role, password_hash, created_at, updated_at)
     VALUES (:id, :email, 'content_manager', :password_hash, :created_at, :updated_at)`,
    {
      id,
      email,
      password_hash: hashPassword(password),
      created_at: stamp,
      updated_at: stamp,
    },
  );
  return {
    id,
    email,
    role: "content_manager",
    createdAt: stamp,
  };
}

export async function deleteContentManager(id: string): Promise<void> {
  await ensureAdminRoleColumn();
  const rows = await query<UserRow[]>(
    "SELECT id, email, password_hash, role FROM admin_users WHERE id = :id LIMIT 1",
    { id },
  );
  const user = rows[0];
  if (!user) throw new Error("Përdoruesi nuk u gjet");
  if (normalizeRole(user.role) !== "content_manager") {
    throw new Error("Mund të fshihet vetëm Content Manager");
  }
  await execute("DELETE FROM admin_users WHERE id = :id", { id });
}

export async function resetContentManagerPassword(
  id: string,
  newPassword: string,
): Promise<void> {
  await ensureAdminRoleColumn();
  if (newPassword.length < 8) {
    throw new Error("Fjalëkalimi duhet të ketë të paktën 8 karaktere");
  }
  const rows = await query<UserRow[]>(
    "SELECT id, email, password_hash, role FROM admin_users WHERE id = :id LIMIT 1",
    { id },
  );
  const user = rows[0];
  if (!user) throw new Error("Përdoruesi nuk u gjet");
  if (normalizeRole(user.role) !== "content_manager") {
    throw new Error("Mund të ndryshohet vetëm Content Manager");
  }
  await execute(
    "UPDATE admin_users SET password_hash = :password_hash, updated_at = :updated_at WHERE id = :id",
    {
      id,
      password_hash: hashPassword(newPassword),
      updated_at: nowIso().slice(0, 23).replace("T", " "),
    },
  );
}

export { SESSION_COOKIE };
