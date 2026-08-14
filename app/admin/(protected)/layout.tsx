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
    <div className="admin-light min-h-screen p-3 text-foreground md:p-5">
      <div className="admin-shell flex min-h-[calc(100vh-1.5rem)] md:min-h-[calc(100vh-2.5rem)]">
        <AdminSidebar />
        <div
          className="my-10 w-px shrink-0 bg-gradient-to-b from-transparent via-[#1a1a1a]/14 to-transparent"
          aria-hidden
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 overflow-auto p-5 md:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
