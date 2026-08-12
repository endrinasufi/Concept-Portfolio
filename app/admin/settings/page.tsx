"use client";

import { ClientLogosEditor } from "@/components/admin/ClientLogosEditor";
import { SiteLogoSettings } from "@/components/admin/SiteLogoSettings";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Settings</h1>
        <p className="mt-2 max-w-lg text-muted">
          Konfigurime lokale të site-it. Të dhënat ruhen në browser (IndexedDB).
        </p>
      </div>

      <SiteLogoSettings />
      <ClientLogosEditor />

      <ul className="space-y-2 text-sm text-muted">
        <li>· Storage: IndexedDB (Dexie)</li>
        <li>· Auth: jo ende — /admin është hapur</li>
        <li>· Deploy: Hostinger-ready Next.js</li>
      </ul>
    </div>
  );
}
