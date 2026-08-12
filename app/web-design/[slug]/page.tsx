import type { Metadata } from "next";
import { WebDesignProjectPageClient } from "@/components/web-design/WebDesignProjectPageClient";

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
    description: `Projekt Web Design: ${title} — Concept Marketing Albania`,
  };
}

export default async function WebDesignProjectPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const isPreview = sp.preview === "true";
  return <WebDesignProjectPageClient slug={slug} isPreview={isPreview} />;
}
