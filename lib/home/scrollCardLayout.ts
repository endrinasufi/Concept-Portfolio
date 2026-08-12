export type CardPose = {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  zIndex: number;
};

/** Raporti lartësi/gjerësi — karta katrore */
export const CARD_ASPECT = 1;

export const MOBILE_MAX = 639;

export function isMobileHome(vw: number): boolean {
  return vw <= MOBILE_MAX;
}

export function homeCardCount(vw: number): number {
  return isMobileHome(vw) ? 5 : 7;
}

/** Zmadhim i kartave vetëm në scene 1 (intro / fan) */
export const SCENE1_CARD_SCALE = 1.13;

/** Zmadhim i kartave vetëm në scene 2 (scroll spread) */
export const SCENE2_CARD_SCALE = 1.3;

function scene1Scale(vw: number): number {
  return isMobileHome(vw) ? 0.92 : SCENE1_CARD_SCALE;
}

function scene2Scale(vw: number): number {
  return isMobileHome(vw) ? 1 : SCENE2_CARD_SCALE;
}

export function cardWidth(vw: number): number {
  if (isMobileHome(vw)) return Math.round(Math.min(92, vw * 0.24));
  if (vw < 1024) return 250;
  return 307;
}

export function cardHeight(vw: number): number {
  return Math.round(cardWidth(vw) * CARD_ASPECT);
}

function fanSpacing(vw: number): number {
  if (isMobileHome(vw)) return Math.round(Math.min(26, vw * 0.068));
  if (vw < 1024) return 131;
  return 157;
}

/** Grumbull i ngushtë — të gjitha kartat mbi të njëjtin pikë */
export function deckPile(total: number, vw: number): CardPose[] {
  const s = scene1Scale(vw);
  return Array.from({ length: total }, (_, i) => ({
    x: (i - (total - 1) / 2) * 0.35 * s,
    y: i * -0.45 * s,
    rotate: -9 + i * 0.25,
    scale: (1 - i * 0.013) * s,
    zIndex: total - i,
  }));
}

/** Sa poshtë fillon grumbulli para fade-up */
export function pileRiseDistance(vw: number): number {
  if (isMobileHome(vw)) return 40;
  if (vw < 1024) return 176;
  return 208;
}

/** Offset anash nga karta 0 në qendër */
function fanSideOffset(index: number, total: number): number {
  if (index === 0) return 0;
  const leftCount = Math.floor((total - 1) / 2);
  if (index <= leftCount) return -index;
  return index - leftCount;
}

/** Fan — karta 0 në mes, të tjerat mbrapa dhe hapen anash */
export function deckFan(total: number, vw: number): CardPose[] {
  const s = scene1Scale(vw);
  const mobile = isMobileHome(vw);
  const spacing = fanSpacing(vw) * s;
  const arc = (mobile ? 5 : 21) * s;
  const rotateStep = mobile ? 3.2 : 4.2;

  return Array.from({ length: total }, (_, i) => {
    const offset = fanSideOffset(i, total);
    const depth = Math.abs(offset);
    const behindLift = depth === 2 ? (mobile ? -4 : -14) * s : 0;

    return {
      x: offset * spacing,
      y: depth * arc + behindLift,
      rotate: offset * rotateStep,
      scale: (1 - depth * (mobile ? 0.018 : 0.025)) * s,
      zIndex: total - depth,
    };
  });
}

/** Scroll faza 1 — fan mblidhet në të njëjtin pikë (grumbull) */
export function deckStacked(total: number, vw: number): CardPose[] {
  const s = scene1Scale(vw);
  return Array.from({ length: total }, (_, i) => ({
    x: i * 0.45 * s,
    y: i * -0.55 * s,
    rotate: -7 + i * 0.28,
    scale: (0.97 - i * 0.011) * s,
    zIndex: total - i,
  }));
}

/** Mobile scene 2 — fan i vogël poshtë tekstit */
function deckSpreadMobile(total: number, vw: number): CardPose[] {
  const s = scene2Scale(vw);
  const spacing = fanSpacing(vw) * 0.85;
  const arc = 6 * s;

  return Array.from({ length: total }, (_, i) => {
    const offset = fanSideOffset(i, total);
    const depth = Math.abs(offset);

    return {
      x: offset * spacing,
      y: 12 * s + depth * arc,
      rotate: offset * 2.6,
      scale: s * 0.96,
      zIndex: total - depth,
    };
  });
}

/** Scroll faza 2 — desktop: hapje poshtë-djathtas */
export function deckSpreadBR(total: number, vw: number): CardPose[] {
  if (isMobileHome(vw)) return deckSpreadMobile(total, vw);

  const s = SCENE2_CARD_SCALE;
  const stepX = (vw < 1024 ? 106 : 134) * s;
  const stepY = (vw < 1024 ? 67 : 86) * s;
  const baseX = (vw < 1024 ? 58 : 83) * s;
  const baseY = (vw < 1024 ? 51 : 67) * s;
  const rotations = [-2, 1.4, -1.2, 2.1, -0.7, 1.5, -2, 0.9];

  return Array.from({ length: total }, (_, i) => ({
    x: baseX + i * stepX,
    y: baseY + i * stepY,
    rotate: rotations[i % rotations.length],
    scale: s,
    zIndex: total - i,
  }));
}

/** Lartësia e scene 2 */
export function stageSpreadOffset(
  vw: number,
  viewportHeight: number,
  firstCardY: number,
  headlineHeight = 0,
): { x: number; y: number } {
  const cardH = cardHeight(vw) * scene2Scale(vw);
  const mobile = isMobileHome(vw);

  if (mobile) {
    const marketReserve = viewportHeight * 0.34;
    const cardsBandTop = headlineHeight + marketReserve + 10;
    const cardsBandCenter =
      cardsBandTop +
      Math.max(96, (viewportHeight - headlineHeight - marketReserve) * 0.32);
    const idleCenter = headlineHeight + (viewportHeight - headlineHeight) / 2;
    return {
      x: 0,
      y: cardsBandCenter - idleCenter - firstCardY + cardH * 0.12,
    };
  }

  const targetTopRatio = 0.16;
  const extraLift = -28;
  const targetTop = viewportHeight * targetTopRatio;
  const stageCenterY = viewportHeight / 2;
  return {
    x: 0,
    y: targetTop - stageCenterY - firstCardY + cardH / 2 + extraLift,
  };
}

export function stageOffset(
  phase: "hero" | "spread" | "collapsed" | "market" | "cascade" | "exit",
  vw: number,
): { x: number; y: number } {
  const mobile = isMobileHome(vw);

  switch (phase) {
    case "hero":
      return { x: 0, y: mobile ? 0 : vw < 1024 ? 72 : 92 };
    case "spread":
      return { x: 0, y: 0 };
    case "collapsed":
      return { x: 0, y: mobile ? 20 : 58 };
    case "market":
      return {
        x: mobile ? 0 : vw < 1024 ? -24 : -36,
        y: mobile ? 48 : 52,
      };
    case "cascade":
      return {
        x: mobile ? 0 : vw < 1024 ? -28 : -44,
        y: mobile ? 36 : 38,
      };
    case "exit":
      return {
        x: mobile ? 0 : -48,
        y: mobile ? -12 : -28,
      };
  }
}

export function portfolioRotation(vw: number): number {
  return isMobileHome(vw) ? -3 : -7;
}

export { cardWidth as cardSize };
