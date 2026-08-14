import type { Metadata } from "next";
import { AnalyticsReport } from "@/components/admin/analytics/AnalyticsReport";

export const metadata: Metadata = {
  title: "Analitika",
};

export default function AdminAnalyticsPage() {
  return <AnalyticsReport />;
}
