"use client";

import { useCallback, useEffect, useState } from "react";
import type { ContactEntry, ContactStatus } from "@/types/contact";
import { Archive, Check, Mail, Trash2 } from "lucide-react";

const filters: { key: "all" | ContactStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "read", label: "Read" },
  { key: "archived", label: "Archived" },
];

export function ContactEntriesAdmin() {
  const [items, setItems] = useState<ContactEntry[]>([]);
  const [filter, setFilter] = useState<"all" | ContactStatus>("all");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = filter === "all" ? "" : `?status=${filter}`;
      const res = await fetch(`/api/admin/contact${q}`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Could not load messages");
      setItems((await res.json()) as ContactEntry[]);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(id: string, status: ContactStatus) {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/contact", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Update failed");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/contact?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1.5 text-xs ${
              filter === f.key
                ? "bg-foreground text-white"
                : "border border-border text-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {message ? (
        <p className="rounded-lg border border-border bg-white/70 px-3 py-2 text-sm">
          {message}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">No messages in this filter.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-border bg-white/70 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <a
                    href={`mailto:${item.email}`}
                    className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted hover:text-foreground"
                  >
                    <Mail size={12} /> {item.email}
                  </a>
                  {item.phone ? (
                    <p className="mt-0.5 text-xs text-muted">{item.phone}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                      item.status === "new"
                        ? "bg-emerald-50 text-emerald-700"
                        : item.status === "read"
                          ? "bg-[#1a1a1a]/8 text-muted"
                          : "bg-[#1a1a1a]/5 text-muted"
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-[10px] text-muted">
                    {new Date(item.createdAt).toLocaleString("en-US")}
                  </span>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                {item.message}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.status !== "read" ? (
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void setStatus(item.id, "read")}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px]"
                  >
                    <Check size={12} /> Mark read
                  </button>
                ) : null}
                {item.status !== "archived" ? (
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void setStatus(item.id, "archived")}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px]"
                  >
                    <Archive size={12} /> Archive
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => void remove(item.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-red-500/30 px-3 py-1 text-[11px] text-red-600"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
