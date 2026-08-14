"use client";

import { useMediaUrl } from "@/lib/hooks/useMediaUrl";
import { useSiteSettings } from "@/lib/hooks/useSiteSettings";

export function AdminBrandLogo({
  height = 22,
  className,
  onDark = false,
}: {
  height?: number;
  className?: string;
  onDark?: boolean;
}) {
  const { settings, loading } = useSiteSettings();
  const src = useMediaUrl(settings.adminLogoMediaId);

  if (loading) {
    return <span className="block h-8 w-40" aria-hidden />;
  }

  if (!src) {
    return (
      <span
        className={`flex h-10 items-center text-left text-[11px] tracking-wide ${
          onDark ? "text-white/35" : "text-muted"
        }`}
      >
        Logo e dashboard-it
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Logo e dashboard-it"
      width={240}
      height={21}
      decoding="async"
      className={className}
      style={{ height, width: "auto", maxWidth: "100%", display: "block" }}
    />
  );
}
