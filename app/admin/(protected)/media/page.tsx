import { redirect } from "next/navigation";
import { AdminMediaView } from "@/components/admin/AdminMediaView";
import { getSession } from "@/lib/server/auth";
import { isAdminRole } from "@/lib/permissions";

export default async function AdminMediaPage() {
  const session = await getSession();
  if (!isAdminRole(session?.role)) {
    redirect("/admin");
  }
  return <AdminMediaView />;
}
