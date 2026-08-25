"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, UserPlus } from "lucide-react";

type ManagedUser = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
};

export function ContentManagersEditor() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/admin/users", {
      credentials: "include",
      cache: "no-store",
    });
    const data = (await res.json()) as { users?: ManagedUser[]; error?: string };
    if (!res.ok) throw new Error(data.error || "Could not load users");
    setUsers(data.users ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await refresh();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Create failed");
      setEmail("");
      setPassword("");
      setMessage("Content Manager created.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function removeUser(id: string) {
    if (!window.confirm("Delete this Content Manager?")) return;
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setMessage("User deleted.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(id: string) {
    const next = window.prompt("New password (min. 8 characters)");
    if (!next) return;
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: next }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Update failed");
      setMessage("Password updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl bg-white/70 p-4">
      <div>
        <h2 className="text-sm font-medium">Content Manager</h2>
        <p className="mt-0.5 text-xs text-muted">
          Can manage content, but not Settings, Analytics, or Media.
        </p>
      </div>

      <form
        onSubmit={(e) => void createUser(e)}
        className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
      >
        <input
          type="email"
          required
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Password (min. 8)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs text-background disabled:opacity-60"
        >
          <UserPlus size={13} /> Add
        </button>
      </form>

      {error ? <p className="text-xs text-red-500">{error}</p> : null}
      {message ? <p className="text-xs text-green-600">{message}</p> : null}

      <ul className="space-y-2">
        {loading ? (
          <li className="text-xs text-muted">Loading…</li>
        ) : users.length === 0 ? (
          <li className="text-xs text-muted">No Content Manager yet.</li>
        ) : (
          users.map((user) => (
            <li
              key={user.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.email}</p>
                <p className="text-[11px] text-muted">Content Manager</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void resetPassword(user.id)}
                  className="rounded-full border border-border px-2.5 py-1 text-[11px] disabled:opacity-50"
                >
                  Reset password
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void removeUser(user.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] disabled:opacity-50"
                >
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
