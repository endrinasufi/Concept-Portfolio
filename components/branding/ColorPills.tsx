"use client";

import type { BrandColor } from "@/types/branding";
import { sortByOrder } from "@/lib/utils/id";

const PILL_INSET =
  "inset 2px 3px 8px rgba(0,0,0,0.45), inset -1px -2px 5px rgba(255,255,255,0.22), inset 0 0 0 1px rgba(255,255,255,0.08)";

export function ColorPills({
  colors,
  orientation = "vertical",
  className = "",
}: {
  colors: BrandColor[];
  orientation?: "vertical" | "horizontal";
  className?: string;
  /** @deprecated Sfondi i kontejnerit u hoq — mbahet për kompatibilitet */
  backgroundColor?: string;
}) {
  const sorted = sortByOrder(colors);
  const isVertical = orientation === "vertical";

  return (
    <div
      className={`flex shrink-0 bg-transparent ${
        isVertical
          ? "h-full min-h-0 w-[3.75rem] flex-col gap-2.5 self-stretch md:w-[4.25rem]"
          : "h-auto w-full min-h-[4.5rem] flex-row gap-2.5"
      } ${className}`}
      role="list"
      aria-label="Paleta e markës"
    >
      {sorted.map((c) => (
        <div
          key={c.id}
          role="listitem"
          title={c.hex}
          className={`relative min-h-0 overflow-hidden rounded-full transition-[filter] duration-300 hover:brightness-110 ${
            isVertical
              ? "w-full flex-1 basis-0 grow"
              : "h-full min-h-14 flex-1 basis-0 grow"
          }`}
          style={{
            backgroundColor: c.hex,
            boxShadow: PILL_INSET,
          }}
        >
          <span
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.22) 0%, transparent 42%, rgba(0,0,0,0.18) 100%)",
            }}
            aria-hidden
          />
          <span className="sr-only">{c.hex}</span>
        </div>
      ))}
    </div>
  );
}
