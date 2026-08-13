import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next && params.next.startsWith("/admin") ? params.next : "/admin";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface/60 p-8 shadow-sm">
        <p className="font-display text-2xl">CMA Admin</p>
        <p className="mt-2 text-sm text-muted">Hyr për të menaxhuar portfolion.</p>
        <AdminLoginForm nextPath={next} />
      </div>
    </div>
  );
}
