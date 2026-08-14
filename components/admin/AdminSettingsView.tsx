"use client";

import { useState } from "react";
import { ClientLogosEditor } from "@/components/admin/ClientLogosEditor";
import { ContentManagersEditor } from "@/components/admin/ContentManagersEditor";
import { SiteLogoSettings } from "@/components/admin/SiteLogoSettings";

export function AdminSettingsView() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Ndryshimi dështoi");
        return;
      }
      setMessage("Fjalëkalimi u ndryshua.");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setError("Nuk u lidh me serverin");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1>Settings</h1>
        <p>
          Logo, favicon, logo klientësh, Content Manager dhe fjalëkalimi.
        </p>
      </div>

      <SiteLogoSettings />
      <ClientLogosEditor />
      <ContentManagersEditor />

      <form
        onSubmit={changePassword}
        className="max-w-sm space-y-2.5 rounded-2xl bg-white/70 p-4"
      >
        <h2 className="text-sm font-medium">Ndrysho fjalëkalimin</h2>
        <label className="block text-xs">
          <span className="text-muted">Fjalëkalimi aktual</span>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm"
          />
        </label>
        <label className="block text-xs">
          <span className="text-muted">Fjalëkalimi i ri (min. 8)</span>
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm"
          />
        </label>
        {error ? <p className="text-xs text-red-500">{error}</p> : null}
        {message ? <p className="text-xs text-green-600">{message}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-foreground px-3 py-1.5 text-xs text-background disabled:opacity-60"
        >
          {loading ? "Duke ruajtur…" : "Ruaj fjalëkalimin"}
        </button>
      </form>
    </div>
  );
}
