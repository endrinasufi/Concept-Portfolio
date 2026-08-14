import { redirect } from "next/navigation";
import { AdminSettingsView } from "@/components/admin/AdminSettingsView";
import { getSession } from "@/lib/server/auth";
import { isAdminRole } from "@/lib/permissions";

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!isAdminRole(session?.role)) {
    redirect("/admin");
  }
  return <AdminSettingsView />;
}
