"use client";

import { useEffect, useRef } from "react";
import { useMediaUrl } from "@/lib/hooks/useMediaUrl";
import { useSiteSettings } from "@/lib/hooks/useSiteSettings";

export function SiteFavicon() {
  const { settings } = useSiteSettings();
  const url = useMediaUrl(settings.faviconMediaId);
  const lastHref = useRef<string | null>(null);

  useEffect(() => {
    const href = url || "/icon";
    if (lastHref.current === href) return;
    lastHref.current = href;
    applyIcon(href);
  }, [url]);

  return null;
}

function applyIcon(href: string) {
  const links = document.querySelectorAll<HTMLLinkElement>(
    'link[rel="icon"], link[rel="shortcut icon"]',
  );
  if (links.length === 0) {
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = href;
    document.head.appendChild(link);
    return;
  }
  links.forEach((link) => {
    if (link.href !== href && !link.href.endsWith(href)) {
      link.href = href;
    }
  });
}
