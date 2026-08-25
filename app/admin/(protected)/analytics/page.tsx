import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AnalyticsReport } from "@/components/admin/analytics/AnalyticsReport";
import { getSession } from "@/lib/server/auth";
import { isAdminRole } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Analytics",
};

export default async function AdminAnalyticsPage() {
  const session = await getSession();
  if (!isAdminRole(session?.role)) {
    redirect("/admin");
  }
  return <AnalyticsReport />;
}
