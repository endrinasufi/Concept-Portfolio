import type { Metadata } from "next";
import { BrandingProjectPageClient } from "@/components/branding/BrandingProjectPageClient";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    title,
    description: `Projekt branding: ${title} — Concept Marketing Albania`,
  };
}

export default async function BrandingProjectPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const isPreview = sp.preview === "true";
  return <BrandingProjectPageClient slug={slug} isPreview={isPreview} />;
}
