import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getSession } from "@/lib/server/auth";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar userEmail={session.email} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex-1 overflow-auto p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}
