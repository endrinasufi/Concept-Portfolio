import { createId, nowIso } from "@/lib/utils/id";
import { execute, query, type RowDataPacket } from "@/lib/server/db";
import type { ContactEntry, ContactStatus } from "@/types/contact";

export type { ContactEntry, ContactStatus };

interface ContactRow extends RowDataPacket {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: ContactStatus;
  created_at: Date | string;
  updated_at: Date | string;
}

let tableReady = false;

export async function ensureContactEntriesTable(): Promise<void> {
  if (tableReady) return;
  await execute(`
    CREATE TABLE IF NOT EXISTS contact_entries (
      id VARCHAR(36) NOT NULL PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(40) NULL,
      message TEXT NOT NULL,
      status ENUM('new', 'read', 'archived') NOT NULL DEFAULT 'new',
      created_at DATETIME(3) NOT NULL,
      updated_at DATETIME(3) NOT NULL,
      INDEX idx_contact_status (status),
      INDEX idx_contact_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  tableReady = true;
}

function toEntry(row: ContactRow): ContactEntry {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || undefined,
    message: row.message,
    status: row.status,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
    updatedAt:
      row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : String(row.updated_at),
  };
}

export async function createContactEntry(input: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<ContactEntry> {
  await ensureContactEntriesTable();
  const stamp = nowIso();
  const id = createId();
  await execute(
    `INSERT INTO contact_entries
      (id, name, email, phone, message, status, created_at, updated_at)
     VALUES
      (:id, :name, :email, :phone, :message, 'new', :created_at, :updated_at)`,
    {
      id,
      name: input.name.trim().slice(0, 160),
      email: input.email.trim().toLowerCase().slice(0, 255),
      phone: input.phone?.trim().slice(0, 40) || null,
      message: input.message.trim().slice(0, 5000),
      created_at: stamp,
      updated_at: stamp,
    },
  );
  return {
    id,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || undefined,
    message: input.message.trim(),
    status: "new",
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export async function listContactEntries(opts?: {
  status?: ContactStatus;
}): Promise<ContactEntry[]> {
  await ensureContactEntriesTable();
  const rows = opts?.status
    ? await query<ContactRow[]>(
        `SELECT * FROM contact_entries WHERE status = :status ORDER BY created_at DESC`,
        { status: opts.status },
      )
    : await query<ContactRow[]>(
        `SELECT * FROM contact_entries ORDER BY created_at DESC`,
      );
  return rows.map(toEntry);
}

export async function updateContactStatus(
  id: string,
  status: ContactStatus,
): Promise<ContactEntry | null> {
  await ensureContactEntriesTable();
  const stamp = nowIso();
  await execute(
    `UPDATE contact_entries SET status = :status, updated_at = :updated_at WHERE id = :id`,
    { id, status, updated_at: stamp },
  );
  const rows = await query<ContactRow[]>(
    `SELECT * FROM contact_entries WHERE id = :id LIMIT 1`,
    { id },
  );
  return rows[0] ? toEntry(rows[0]) : null;
}

export async function deleteContactEntry(id: string): Promise<void> {
  await ensureContactEntriesTable();
  await execute(`DELETE FROM contact_entries WHERE id = :id`, { id });
}

export async function countNewContactEntries(): Promise<number> {
  await ensureContactEntriesTable();
  const rows = await query<RowDataPacket[]>(
    `SELECT COUNT(*) AS c FROM contact_entries WHERE status = 'new'`,
  );
  return Number(rows[0]?.c ?? 0);
}
