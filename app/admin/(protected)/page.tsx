import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { ContentManagerDashboard } from "@/components/admin/ContentManagerDashboard";
import { getSession } from "@/lib/server/auth";
import { isContentManagerRole } from "@/lib/permissions";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (isContentManagerRole(session?.role)) {
    return <ContentManagerDashboard />;
  }
  return <AdminDashboard />;
}
