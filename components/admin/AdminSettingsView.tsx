"use client";

import { useEffect, useState } from "react";
import { AdminFooterView } from "@/components/admin/AdminFooterView";
import { AdminSubNav } from "@/components/admin/AdminSubNav";
import { ContactInfoSettingsEditor } from "@/components/admin/ContactInfoSettingsEditor";
import { ContentManagersEditor } from "@/components/admin/ContentManagersEditor";
import { MailSettingsEditor } from "@/components/admin/MailSettingsEditor";
import { OpenAiSettingsEditor } from "@/components/admin/OpenAiSettingsEditor";
import { SiteLogoSettings } from "@/components/admin/SiteLogoSettings";
import { SeoWeeklyRunner } from "@/components/admin/SeoWeeklyRunner";

type SettingsTab =
  | "logo"
  | "contact"
  | "mail"
  | "footer"
  | "seo"
  | "team"
  | "password";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "logo", label: "Brand & logos" },
  { id: "contact", label: "Contact & map" },
  { id: "mail", label: "Form email" },
  { id: "footer", label: "Footer" },
  { id: "seo", label: "SEO & OpenAI" },
  { id: "team", label: "Team" },
  { id: "password", label: "Password" },
];

export function AdminSettingsView() {
  const [tab, setTab] = useState<SettingsTab>("logo");

  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get("tab");
    if (next && TABS.some((item) => item.id === next)) {
      setTab(next as SettingsTab);
    }
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1>Settings</h1>
        <p>Site branding, contact, mail, footer, SEO, team, and account security.</p>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:gap-8">
        <aside className="w-full shrink-0 lg:w-48">
          <AdminSubNav
            title="Settings"
            items={TABS}
            active={tab}
            onChange={(id) => setTab(id as SettingsTab)}
          />
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          {tab === "logo" ? <SiteLogoSettings /> : null}
          {tab === "contact" ? <ContactInfoSettingsEditor /> : null}
          {tab === "mail" ? <MailSettingsEditor /> : null}
          {tab === "footer" ? (
            <AdminFooterView
              embedded
              onEditContact={() => setTab("contact")}
            />
          ) : null}
          {tab === "seo" ? (
            <>
              <OpenAiSettingsEditor />
              <SeoWeeklyRunner />
            </>
          ) : null}
          {tab === "team" ? <ContentManagersEditor /> : null}
          {tab === "password" ? <PasswordSettingsForm /> : null}
        </div>
      </div>
    </div>
  );
}

function PasswordSettingsForm() {
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
        setError(data.error || "Change failed");
        return;
      }
      setMessage("Password changed.");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setError("Could not connect to the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={changePassword}
      className="max-w-sm space-y-2.5 rounded-2xl bg-white/70 p-4"
    >
      <h2 className="text-sm font-medium">Change password</h2>
      <label className="block text-xs">
        <span className="text-muted">Current password</span>
        <input
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm"
        />
      </label>
      <label className="block text-xs">
        <span className="text-muted">New password (min. 8)</span>
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
        {loading ? "Saving…" : "Save password"}
      </button>
    </form>
  );
}
