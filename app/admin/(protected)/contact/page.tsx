import type { Metadata } from "next";
import { ContactEntriesAdmin } from "@/components/admin/ContactEntriesAdmin";
import { SeoWeeklyRunner } from "@/components/admin/SeoWeeklyRunner";

export const metadata: Metadata = {
  title: "Contact",
  robots: { index: false, follow: false },
};

export default function AdminContactPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Contact</h1>
        <p className="mt-1 text-sm text-muted">
          Messages from the public /kontakt form.
        </p>
      </div>
      <ContactEntriesAdmin />
      <SeoWeeklyRunner />
    </div>
  );
}
