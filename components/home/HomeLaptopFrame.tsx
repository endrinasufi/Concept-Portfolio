"use client";

import { MediaImage } from "@/components/branding/MediaImage";

type Rgb = { r: number; g: number; b: number };

function parseHex(hex: string): Rgb | null {
  const h = hex.trim().replace("#", "");
  if (h.length === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    };
  }
  if (h.length === 6 && /^[0-9a-fA-F]+$/.test(h)) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }
  return null;
}

function clamp(n: number, min = 0, max = 255) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function toHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b]
    .map((v) => clamp(v).toString(16).padStart(2, "0"))
    .join("")}`;
}

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

function rgba(c: Rgb, a: number): string {
  return `rgba(${clamp(c.r)}, ${clamp(c.g)}, ${clamp(c.b)}, ${a})`;
}

/** Nude bazë — më e fortë se cream e lehtë */
const NUDE: Rgb = { r: 232, g: 220, b: 204 };
const NUDE_DEEP: Rgb = { r: 214, g: 196, b: 174 };
const CREAM: Rgb = { r: 248, g: 242, b: 232 };

const FALLBACK_ACCENTS = [
  "#c4a484",
  "#b8956e",
  "#9a7b62",
  "#d4a574",
  "#a67c5d",
  "#c9a227",
  "#8b7355",
  "#bfa08a",
];

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickAccent(colors: string[] | undefined, seed: string): Rgb {
  for (const c of colors ?? []) {
    const rgb = parseHex(c);
    if (rgb) return rgb;
  }
  const fallback =
    FALLBACK_ACCENTS[hashSeed(seed) % FALLBACK_ACCENTS.length] ?? "#c4a484";
  return parseHex(fallback) ?? { r: 196, g: 164, b: 132 };
}

function buildBackground(accent: Rgb) {
  // Nude i fortë i ngjyrosur me ngjyrën e brandit/website-it
  const base = mix(NUDE, accent, 0.38);
  const mid = mix(NUDE_DEEP, accent, 0.45);
  const light = mix(CREAM, accent, 0.22);
  const glow = mix(accent, CREAM, 0.35);

  return {
    base: toHex(base),
    gradient: [
      `radial-gradient(75% 60% at 50% 32%, ${rgba(glow, 0.55)}, transparent 72%)`,
      `radial-gradient(55% 45% at 80% 85%, ${rgba(accent, 0.18)}, transparent 70%)`,
      `linear-gradient(165deg, ${toHex(light)} 0%, ${toHex(base)} 48%, ${toHex(mid)} 100%)`,
    ].join(", "),
  };
}

/** Mockup elegant laptop — fotoja e projektit brenda ekranit. */
export function HomeLaptopFrame({
  mediaId,
  imageUrl,
  alt,
  seed = alt,
  accentColors,
}: {
  mediaId?: string;
  imageUrl?: string;
  alt: string;
  seed?: string;
  /** Ngjyrat e website/projektit që reklamohet */
  accentColors?: string[];
}) {
  const accent = pickAccent(accentColors, seed);
  const bg = buildBackground(accent);

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ backgroundColor: bg.base }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{ background: bg.gradient }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 opacity-60"
        aria-hidden
        style={{
          background: `radial-gradient(50% 80% at 50% 100%, ${rgba(accent, 0.14)}, transparent)`,
        }}
      />

      <div className="relative z-[1] flex w-[86%] max-w-[18.5rem] flex-col items-center">
        <div className="w-full rounded-[0.65rem] bg-gradient-to-b from-[#3a3d44] via-[#2a2d33] to-[#1e2126] p-[0.35rem] shadow-[0_14px_32px_rgba(0,0,0,0.18),0_2px_0_rgba(255,255,255,0.06)_inset]">
          <div className="relative overflow-hidden rounded-[0.4rem] bg-[#0a0a0b] ring-1 ring-black/40">
            <div
              className="absolute left-1/2 top-[0.28rem] z-[2] h-[0.28rem] w-[0.28rem] -translate-x-1/2 rounded-full bg-[#15171a] ring-1 ring-white/10"
              aria-hidden
            />
            <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#111]">
              <MediaImage
                mediaId={mediaId}
                imageUrl={imageUrl}
                alt={alt}
                fit="cover"
                objectPosition="50% 0%"
                className="pointer-events-none h-full w-full"
              />
              <div
                className="pointer-events-none absolute inset-0"
                aria-hidden
                style={{
                  background:
                    "linear-gradient(125deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 28%, transparent 48%)",
                }}
              />
            </div>
          </div>
        </div>

        <div
          className="relative z-[1] -mt-px h-[0.28rem] w-[22%] rounded-b-[0.2rem] bg-gradient-to-b from-[#4a4e56] to-[#2e3238]"
          aria-hidden
        />

        <div className="relative -mt-px w-[108%] max-w-none">
          <div className="h-[0.55rem] rounded-b-[0.55rem] bg-gradient-to-b from-[#3f434a] via-[#2c3036] to-[#1a1d22] shadow-[0_8px_18px_rgba(0,0,0,0.16)]" />
          <div
            className="mx-auto -mt-[0.28rem] h-[0.22rem] w-[18%] rounded-full bg-[#0e1013]/70"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
