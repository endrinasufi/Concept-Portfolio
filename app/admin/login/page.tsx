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
    <div className="admin-light flex min-h-screen items-center justify-center px-4 text-foreground">
      <div className="admin-card w-full max-w-md p-8">
        <p className="inline-flex rounded-full border border-[#1a1a1a]/20 px-4 py-1.5 text-sm font-semibold">
          CMA
        </p>
        <p className="admin-serif mt-5 text-3xl">Hyr në admin</p>
        <p className="mt-2 text-sm text-muted">Menaxho portfolion.</p>
        <AdminLoginForm nextPath={next} />
      </div>
    </div>
  );
}
