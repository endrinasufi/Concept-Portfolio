import { organizationJsonLd } from "@/lib/seo/jsonLd";

export function JsonLd({ data }: { data: Record<string, unknown> | object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return <JsonLd data={organizationJsonLd()} />;
}
