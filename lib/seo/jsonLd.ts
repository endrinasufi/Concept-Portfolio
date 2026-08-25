import {
  SITE_NAME,
  SITE_DEFAULT_DESCRIPTION,
  siteOrigin,
  type SeoService,
  serviceLabel,
} from "./metadata";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: siteOrigin(),
    logo: `${siteOrigin()}/brand/logo-light.svg`,
    description: SITE_DEFAULT_DESCRIPTION,
    areaServed: "AL",
  };
}

export function creativeWorkJsonLd(opts: {
  title: string;
  description?: string;
  url: string;
  image?: string;
  service?: SeoService;
  client?: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: opts.title,
    description: opts.description,
    url: opts.url,
    image: opts.image,
    dateModified: opts.dateModified,
    creator: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    about: opts.service ? serviceLabel(opts.service) : undefined,
    client: opts.client
      ? { "@type": "Organization", name: opts.client }
      : undefined,
  };
}

export function contactPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact — ${SITE_NAME}`,
    url: `${siteOrigin()}/kontakt`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: siteOrigin(),
    },
  };
}
