"use client";

import { useEffect, useState } from "react";
import { useSiteSettings } from "@/lib/hooks/useSiteSettings";

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm";

export function MailSettingsEditor() {
  const { settings, loading, update } = useSiteSettings();
  const [notifyEmail, setNotifyEmail] = useState("info@conceptmarketing.al");
  const [smtpHost, setSmtpHost] = useState("smtp.hostinger.com");
  const [smtpPort, setSmtpPort] = useState("465");
  const [smtpSecure, setSmtpSecure] = useState(true);
  const [smtpUser, setSmtpUser] = useState("info@conceptmarketing.al");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpFrom, setSmtpFrom] = useState(
    "Concept Marketing <info@conceptmarketing.al>",
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    setNotifyEmail(
      settings.contactNotifyEmail?.trim() || "info@conceptmarketing.al",
    );
    setSmtpHost(settings.smtpHost?.trim() || "smtp.hostinger.com");
    setSmtpPort(String(settings.smtpPort ?? 465));
    setSmtpSecure(settings.smtpSecure ?? true);
    setSmtpUser(settings.smtpUser?.trim() || "info@conceptmarketing.al");
    setSmtpFrom(
      settings.smtpFrom?.trim() ||
        "Concept Marketing <info@conceptmarketing.al>",
    );
    if (settings.hasSmtpPass && settings.smtpPassMasked) {
      setSmtpPass(settings.smtpPassMasked);
    } else {
      setSmtpPass("");
    }
  }, [
    loading,
    settings.contactNotifyEmail,
    settings.smtpHost,
    settings.smtpPort,
    settings.smtpSecure,
    settings.smtpUser,
    settings.smtpFrom,
    settings.hasSmtpPass,
    settings.smtpPassMasked,
  ]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const port = Number(smtpPort);
      const patch: {
        contactNotifyEmail: string;
        smtpHost: string;
        smtpPort: number;
        smtpSecure: boolean;
        smtpUser: string;
        smtpFrom: string;
        smtpPass?: string | null;
      } = {
        contactNotifyEmail:
          notifyEmail.trim() || "info@conceptmarketing.al",
        smtpHost: smtpHost.trim() || "smtp.hostinger.com",
        smtpPort: Number.isFinite(port) && port > 0 ? port : 465,
        smtpSecure,
        smtpUser: smtpUser.trim() || "info@conceptmarketing.al",
        smtpFrom:
          smtpFrom.trim() ||
          "Concept Marketing <info@conceptmarketing.al>",
      };
      const trimmedPass = smtpPass.trim();
      if (!trimmedPass) {
        patch.smtpPass = null;
      } else if (!trimmedPass.includes("…")) {
        patch.smtpPass = trimmedPass;
      }

      const next = await update(patch);
      setMessage(
        next.hasSmtpPass
          ? "Mail settings saved. Contact form will email notifications."
          : "Saved, but SMTP password is missing — emails will not send.",
      );
      if (next.smtpPassMasked) setSmtpPass(next.smtpPassMasked);
      else setSmtpPass("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function clearPass() {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      await update({ smtpPass: null });
      setSmtpPass("");
      setMessage("SMTP password removed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void save(e)}
      className="space-y-3 rounded-2xl bg-white/70 p-4"
    >
      <div>
        <h2 className="text-sm font-medium">Contact form email</h2>
        <p className="mt-0.5 text-[11px] text-muted">
          Configure SMTP here (Hostinger or other). Every form submission is
          emailed to the notify address. Password is stored in the database and
          never shown publicly.
        </p>
      </div>

      <label className="block text-xs">
        <span className="text-muted">Notify to (recipient)</span>
        <input
          className={inputClass}
          type="email"
          value={notifyEmail}
          onChange={(e) => setNotifyEmail(e.target.value)}
          placeholder="info@conceptmarketing.al"
          required
        />
      </label>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="block text-xs sm:col-span-2">
          <span className="text-muted">SMTP host</span>
          <input
            className={inputClass}
            value={smtpHost}
            onChange={(e) => setSmtpHost(e.target.value)}
            placeholder="smtp.hostinger.com"
          />
        </label>
        <label className="block text-xs">
          <span className="text-muted">Port</span>
          <input
            className={inputClass}
            type="number"
            value={smtpPort}
            onChange={(e) => setSmtpPort(e.target.value)}
            placeholder="465"
          />
        </label>
        <label className="flex items-end gap-2 pb-1.5 text-xs">
          <input
            type="checkbox"
            checked={smtpSecure}
            onChange={(e) => setSmtpSecure(e.target.checked)}
            className="rounded border-border"
          />
          <span className="text-muted">Secure (SSL/TLS)</span>
        </label>
        <label className="block text-xs sm:col-span-2">
          <span className="text-muted">SMTP username (email)</span>
          <input
            className={inputClass}
            type="email"
            value={smtpUser}
            onChange={(e) => setSmtpUser(e.target.value)}
            placeholder="info@conceptmarketing.al"
          />
        </label>
        <label className="block text-xs sm:col-span-2">
          <span className="text-muted">SMTP password</span>
          <input
            className={inputClass}
            type="password"
            autoComplete="new-password"
            value={smtpPass}
            onChange={(e) => setSmtpPass(e.target.value)}
            placeholder="Email account password"
          />
        </label>
        <label className="block text-xs sm:col-span-2">
          <span className="text-muted">From (display)</span>
          <input
            className={inputClass}
            value={smtpFrom}
            onChange={(e) => setSmtpFrom(e.target.value)}
            placeholder='Concept Marketing &lt;info@conceptmarketing.al&gt;'
          />
        </label>
      </div>

      {settings.hasSmtpPass ? (
        <p className="text-[11px] text-green-700">
          SMTP password active
          {settings.smtpPassMasked ? `: ${settings.smtpPassMasked}` : ""}
        </p>
      ) : (
        <p className="text-[11px] text-muted">No SMTP password saved yet.</p>
      )}

      {error ? <p className="text-xs text-red-500">{error}</p> : null}
      {message ? <p className="text-xs text-green-600">{message}</p> : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={busy || loading}
          className="rounded-full bg-foreground px-3 py-1.5 text-xs text-background disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save mail settings"}
        </button>
        {settings.hasSmtpPass ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void clearPass()}
            className="rounded-full border border-border px-3 py-1.5 text-xs disabled:opacity-60"
          >
            Remove password
          </button>
        ) : null}
      </div>
    </form>
  );
}
