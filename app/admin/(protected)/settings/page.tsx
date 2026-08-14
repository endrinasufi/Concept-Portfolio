"use client";

import { useState } from "react";
import { ClientLogosEditor } from "@/components/admin/ClientLogosEditor";
import { SiteLogoSettings } from "@/components/admin/SiteLogoSettings";

export default function AdminSettingsPage() {
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
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Settings</h1>
        <p className="mt-2 max-w-lg text-muted">
          Logo e site-it, logo klientësh dhe fjalëkalimi i adminit. Të dhënat
          ruhen në MySQL (prod).
        </p>
      </div>

      <SiteLogoSettings />
      <ClientLogosEditor />

      <form
        onSubmit={changePassword}
        className="max-w-md space-y-3 admin-card p-5"
      >
        <h2 className="font-display text-xl">Ndrysho fjalëkalimin</h2>
        <label className="block text-sm">
          <span className="text-muted">Fjalëkalimi aktual</span>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Fjalëkalimi i ri (min. 8)</span>
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
          />
        </label>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        {message ? <p className="text-sm text-green-600">{message}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-foreground px-4 py-2 text-sm text-background disabled:opacity-60"
        >
          {loading ? "Duke ruajtur…" : "Ruaj fjalëkalimin"}
        </button>
      </form>

      <ul className="space-y-2 text-sm text-muted">
        <li>· Storage: MySQL + Cloudinary/local uploads</li>
        <li>· Auth: sesion cookie HttpOnly</li>
        <li>· Migrim IndexedDB: /admin/migration</li>
      </ul>
    </div>
  );
}
