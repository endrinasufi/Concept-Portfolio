"use client";

import type { BrandColor } from "@/types/branding";
import { sortByOrder } from "@/lib/utils/id";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

const PILL_INSET =
  "inset 1px 2px 5px rgba(0,0,0,0.35), inset -1px -1px 3px rgba(255,255,255,0.18)";

/**
 * Paletë moderne: shfaqje me vale + shimmer + expand në hover.
 */
export function AnimatedBrandPalette({
  colors,
  className = "",
}: {
  colors: BrandColor[];
  className?: string;
}) {
  const reduce = useReducedMotion();
  const sorted = sortByOrder(colors).slice(0, 5);
  const [hoverId, setHoverId] = useState<string | null>(null);
  if (!sorted.length) return null;

  return (
    <div
      className={`flex h-3.5 items-stretch gap-1.5 ${className}`}
      role="list"
      aria-label="Brand palette"
      onMouseLeave={() => setHoverId(null)}
    >
      {sorted.map((c, i) => {
        const active = hoverId === c.id;
        return (
          <motion.span
            key={c.id}
            role="listitem"
            title={c.hex}
            onMouseEnter={() => setHoverId(c.id)}
            className="relative min-w-0 overflow-hidden rounded-full"
            style={{
              backgroundColor: c.hex,
              boxShadow: PILL_INSET,
              flexGrow: 1,
              flexBasis: 0,
            }}
            initial={reduce ? false : { scaleX: 0, opacity: 0 }}
            whileInView={reduce ? undefined : { scaleX: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            animate={
              reduce
                ? { flexGrow: active ? 2.4 : 1 }
                : {
                    flexGrow: active ? 2.4 : 1,
                    y: [0, i % 2 === 0 ? -1.2 : 1.2, 0],
                  }
            }
            transition={{
              flexGrow: { type: "spring", stiffness: 420, damping: 32 },
              scaleX: {
                duration: 0.55,
                delay: 0.12 + i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              },
              opacity: { duration: 0.45, delay: 0.12 + i * 0.08 },
              y: {
                duration: 3.2 + i * 0.25,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.15,
              },
            }}
          >
            {!reduce ? (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 w-2/5 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{
                  x: ["-140%", "240%"],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2.2,
                  delay: 1 + i * 0.4,
                  repeat: Infinity,
                  repeatDelay: 2.8 + i * 0.35,
                  ease: "easeInOut",
                }}
              />
            ) : null}
            <span className="sr-only">{c.hex}</span>
          </motion.span>
        );
      })}
    </div>
  );
}
