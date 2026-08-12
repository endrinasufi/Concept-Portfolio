import { PhotoshootingProjectPageClient } from "@/components/photoshooting/PhotoshootingProjectPageClient";

export const metadata = {
  title: "Photoshooting",
  description: "Photoshooting project — Concept Marketing Albania",
};

export default async function PhotoshootingProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PhotoshootingProjectPageClient slug={slug} />;
}
