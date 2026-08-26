import { redirect } from "next/navigation";

export default function AdminFooterPage() {
  redirect("/admin/settings?tab=footer");
}
