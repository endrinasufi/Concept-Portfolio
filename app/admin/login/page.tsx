import type { Metadata } from "next";
import { AdminLoginView } from "@/components/admin/AdminLoginView";

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

  return <AdminLoginView nextPath={next} />;
}
