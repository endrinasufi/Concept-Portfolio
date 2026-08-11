import type { Metadata } from "next";
import { BrandingListClient } from "@/components/branding/BrandingListClient";

export const metadata: Metadata = {
  title: "Branding",
  description: "Lista e projekteve branding nga Concept Marketing Albania.",
};

export default function BrandingPage() {
  return <BrandingListClient />;
}
