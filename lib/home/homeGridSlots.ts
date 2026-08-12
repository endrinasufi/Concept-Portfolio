/**
 * Grid irregular për homepage — 10 kolona × 7 rreshta.
 * Më shumë slotë poshtë; lart pak. Opacity llogaritet nga `row`.
 */

export const HOME_GRID_COLS = 10;
export const HOME_GRID_ROWS = 7;

export type HomeSlotKind = "photo" | "logo" | "button";

export type HomeGridSlot = {
  kind: HomeSlotKind;
  /** 1-based row */
  row: number;
  /** 1-based col */
  col: number;
  /** Indeks brenda llojit (photo 0..n, logo 0..n, button 0..n) */
  index: number;
};

/**
 * Vendosje e crregullt — densitet në rreshtat 4–7.
 * Indekset e button fillojnë nga 0 dhe lidhen me SITE_CATEGORIES.
 */
export const HOME_GRID_SLOTS: HomeGridSlot[] = [
  // Row 1 — shumë e rrallë / invisible
  { kind: "photo", row: 1, col: 3, index: 0 },
  { kind: "logo", row: 1, col: 8, index: 0 },

  // Row 2 — e lehtë
  { kind: "photo", row: 2, col: 1, index: 1 },
  { kind: "photo", row: 2, col: 6, index: 2 },
  { kind: "logo", row: 2, col: 9, index: 1 },

  // Row 3
  { kind: "logo", row: 3, col: 2, index: 2 },
  { kind: "photo", row: 3, col: 5, index: 3 },
  { kind: "photo", row: 3, col: 8, index: 4 },
  { kind: "button", row: 3, col: 10, index: 0 },

  // Row 4 — densitet mesatar
  { kind: "photo", row: 4, col: 1, index: 5 },
  { kind: "logo", row: 4, col: 3, index: 3 },
  { kind: "photo", row: 4, col: 4, index: 6 },
  { kind: "photo", row: 4, col: 7, index: 7 },
  { kind: "logo", row: 4, col: 9, index: 4 },

  // Row 5
  { kind: "logo", row: 5, col: 1, index: 5 },
  { kind: "photo", row: 5, col: 2, index: 8 },
  { kind: "button", row: 5, col: 5, index: 1 },
  { kind: "photo", row: 5, col: 6, index: 9 },
  { kind: "logo", row: 5, col: 8, index: 6 },
  { kind: "photo", row: 5, col: 10, index: 10 },

  // Row 6 — densitet i lartë
  { kind: "photo", row: 6, col: 1, index: 11 },
  { kind: "logo", row: 6, col: 2, index: 7 },
  { kind: "photo", row: 6, col: 3, index: 12 },
  { kind: "photo", row: 6, col: 5, index: 13 },
  { kind: "logo", row: 6, col: 6, index: 8 },
  { kind: "photo", row: 6, col: 8, index: 14 },
  { kind: "photo", row: 6, col: 9, index: 15 },
  { kind: "button", row: 6, col: 10, index: 2 },

  // Row 7 — më i denduri
  { kind: "logo", row: 7, col: 1, index: 9 },
  { kind: "photo", row: 7, col: 2, index: 16 },
  { kind: "photo", row: 7, col: 3, index: 17 },
  { kind: "logo", row: 7, col: 4, index: 10 },
  { kind: "photo", row: 7, col: 5, index: 18 },
  { kind: "photo", row: 7, col: 7, index: 19 },
  { kind: "logo", row: 7, col: 8, index: 11 },
  { kind: "photo", row: 7, col: 9, index: 20 },
  { kind: "photo", row: 7, col: 10, index: 21 },
];

/** Opacity 0 lart → 1 poshtë */
export function slotOpacity(row: number): number {
  if (HOME_GRID_ROWS <= 2) return 1;
  const t = (row - 1) / (HOME_GRID_ROWS - 2);
  return Math.min(1, Math.max(0, t));
}
