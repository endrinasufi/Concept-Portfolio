/** Returns near-white or near-black text for readable contrast on a hex background. */
export function contrastingInk(hex: string): string {
  const raw = hex.replace("#", "").trim();
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw.slice(0, 6);
  if (full.length < 6) return "#f2efe8";
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return "#f2efe8";
  // Relative luminance (sRGB)
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum > 0.55 ? "#141416" : "#f2efe8";
}

export function mutedInk(hex: string): string {
  const ink = contrastingInk(hex);
  return ink === "#141416" ? "rgba(20,20,22,0.55)" : "rgba(242,239,232,0.65)";
}
