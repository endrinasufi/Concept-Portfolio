export type CardPose = {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  zIndex: number;
};

/** Raporti lartësi/gjerësi — karta katrore për të gjitha kategoritë */
export const CARD_ASPECT = 1;

export const MOBILE_MAX = 639;

export function isMobileHome(vw: number): boolean {
  return vw <= MOBILE_MAX;
}

export function homeCardCount(vw: number): number {
  return isMobileHome(vw) ? 5 : 9;
}

export function homeEarlyCardCount(vw: number): number {
  return isMobileHome(vw) ? 5 : 7;
}

/** Shkalla e unifikuar — Branding / Social / Web njësoj */
export const SCENE1_CARD_SCALE = 1.13;
export const SCENE2_CARD_SCALE = 1.13;

function scene1Scale(vw: number): number {
  return isMobileHome(vw) ? 1 : SCENE1_CARD_SCALE;
}

function scene2Scale(vw: number): number {
  return scene1Scale(vw);
}

export function cardWidth(vw: number): number {
  if (isMobileHome(vw)) return Math.round(Math.min(vw * 0.74, 300));
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
    scale: s,
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
      scale: s,
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
    scale: s,
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
      scale: s,
      zIndex: total - depth,
    };
  });
}

/** Skena 3a — kartat mblidhen plotësisht mbi tekst (një grumbull) */
export function deckTextStack(total: number, vw: number): CardPose[] {
  const s = scene1Scale(vw);
  return Array.from({ length: total }, (_, i) => ({
    x: 0,
    y: i * -0.4,
    rotate: 0,
    scale: s,
    zIndex: total - i,
  }));
}

/** Skena 3b — hapje si tifoz, pivot poshtë në qendër, drejt majtas */
export function deckTextFan(total: number, vw: number): CardPose[] {
  const mobile = isMobileHome(vw);
  const s = scene1Scale(vw);
  const hy = (cardHeight(vw) * s) / 2;
  const front = mobile ? 10 : 14;
  const step = mobile ? 9.5 : 11.2;

  return Array.from({ length: total }, (_, i) => {
    const rotate = front - i * step;
    const θ = (rotate * Math.PI) / 180;
    return {
      x: hy * Math.sin(θ),
      y: hy * (1 - Math.cos(θ)),
      rotate,
      scale: s,
      zIndex: total - i,
    };
  });
}

/** Qendron vertikalisht bllokun tekst + karta */
export function scene3Center(
  vw: number,
  viewportHeight: number,
  wrapHeight: number,
) {
  const mobile = isMobileHome(vw);
  const header = mobile ? 56 : 80;
  const gap = mobile ? 12 : 16;
  const baseScale = scene1Scale(vw);
  const peakScale = scene1Scale(vw);
  const cardH = cardHeight(vw) * peakScale;
  const amplitude = mobile ? 32 : 48;
  const groupH = wrapHeight + gap + cardH + amplitude * 0.35;
  const groupTop = Math.max(header, (viewportHeight - groupH) / 2);

  return {
    wrapY: groupTop + wrapHeight / 2 - viewportHeight / 2,
    yBias: groupTop + wrapHeight + gap + cardH / 2 - viewportHeight / 2,
    baseScale,
    peakScale,
    amplitude,
  };
}

/** Skena 3 — valë / lum kartash, jo grid: S-curve me mbivendosje */
export function deckWave(
  total: number,
  vw: number,
  viewportHeight: number,
  wrapHeight: number,
): CardPose[] {
  const mobile = isMobileHome(vw);
  const sidePad = mobile ? 20 : 64;
  const availW = Math.max(280, vw - sidePad * 2);
  const { yBias, baseScale, peakScale, amplitude } = scene3Center(
    vw,
    viewportHeight,
    wrapHeight,
  );

  const radiusX = availW * 0.42;

  const order: number[] = [];
  for (let d = total - 1; d >= 1; d -= 2) order.push(d);
  order.push(0);
  for (let d = 1; d < total; d += 2) order.push(d);

  const pos = new Array<CardPose>(total);

  order.forEach((cardIndex, k) => {
    const t = total === 1 ? 0.5 : k / (total - 1);
    const wave = Math.sin(t * Math.PI * 2);
    const slope = Math.cos(t * Math.PI * 2);
    const depth = Math.abs(t - 0.5) * 2;
    const isFront = cardIndex === 0;

    pos[cardIndex] = {
      x: (t - 0.5) * 2 * radiusX,
      y: -wave * amplitude + yBias,
      rotate: slope * (mobile ? 9 : 14),
      scale: peakScale,
      zIndex: isFront ? 40 : Math.round(8 + (1 - depth) * 18),
    };
  });

  return pos.map(
    (p, i) =>
      p ?? {
        x: 0,
        y: yBias,
        rotate: 0,
        scale: baseScale,
        zIndex: total - i,
      },
  );
}

/** @deprecated alias — përdor deckWave */
export function deckIrregularGrid(
  total: number,
  vw: number,
  viewportHeight: number,
  topReserve: number,
): CardPose[] {
  return deckWave(total, vw, viewportHeight, topReserve);
}

export function stageGridOffset(
  viewportHeight: number,
  topReserve: number,
): { x: number; y: number } {
  const bottomPad = 32;
  const availH = Math.max(260, viewportHeight - topReserve - bottomPad);
  const gridCenter = topReserve + availH / 2;
  return { x: 0, y: gridCenter - viewportHeight / 2 };
}

export function wrapHeadlineToTop(
  vw: number,
  viewportHeight: number,
  wrapHeight: number,
): number {
  return scene3Center(vw, viewportHeight, wrapHeight).wrapY;
}

export function gridTopReserve(
  wrapHeight: number,
  mobile: boolean,
): number {
  const top = mobile ? 56 : 80;
  return top + wrapHeight + (mobile ? 8 : 10);
}

export type MobileDeckStyle = "branding" | "social" | "web";

/** Celular — vendosje krejt e ndryshme për çdo kategori */
export function deckMobileStack(
  total: number,
  vw: number,
  style: MobileDeckStyle = "branding",
): CardPose[] {
  const h = cardHeight(vw);
  const w = cardWidth(vw);

  if (style === "social") {
    // Tifoz: karta 0 në qendër, të tjerat majtas/djathtas
    const spread = Math.min(34, vw * 0.085);
    const arc = 14;
    return Array.from({ length: total }, (_, i) => {
      const side = fanSideOffset(i, total);
      const depth = Math.abs(side);
      return {
        x: side * spread,
        y: depth * arc,
        rotate: side * 7.5,
        scale: 1,
        zIndex: total - depth,
      };
    });
  }

  if (style === "web") {
    // Shkallë: karta kryesore në qendër, të tjerat mbrapa poshtë-djathtas
    const stepX = Math.min(20, w * 0.075);
    const stepY = Math.min(34, h * 0.11);
    return Array.from({ length: total }, (_, i) => ({
      x: i * stepX,
      y: i * stepY,
      rotate: i * 1.6,
      scale: 1,
      zIndex: total - i,
    }));
  }

  // Branding — tufë vertikale e mbivendosur, karta katrore
  const xs = [4, -26, 20, -12, 28, -6, 14];
  const rots = [-3.6, 5.2, -2.2, 4.2, -4.6, 2.4, -1.4];
  const square = w;
  const peek = Math.round(Math.min(48, square * 0.125));
  const stackH = square + Math.max(0, total - 1) * peek;
  const y0 = -stackH / 2 + square / 2;
  return Array.from({ length: total }, (_, i) => ({
    x: xs[i % xs.length],
    y: y0 + i * peek,
    rotate: rots[i % rots.length],
    scale: 1,
    zIndex: total - i,
  }));
}

/** Celular — dalje e kartës, stil i ndryshëm për çdo kategori */
export function deckMobileExit(
  index: number,
  vw: number,
  from: CardPose,
  style: MobileDeckStyle = "branding",
): CardPose {
  if (style === "social") {
    // Të gjitha fluturojnë lart me rrotullim
    const sway = index % 2 === 0 ? -0.18 : 0.18;
    return {
      x: from.x + vw * sway,
      y: from.y - vw * 0.85,
      rotate: from.rotate + (index % 2 === 0 ? -25 : 25),
      scale: 0.82,
      zIndex: from.zIndex + 24,
    };
  }

  if (style === "web") {
    // Bien poshtë + zvogëlohen
    const dir = index % 2 === 0 ? -1 : 1;
    return {
      x: from.x + dir * vw * 0.2,
      y: from.y + vw * 0.9,
      rotate: from.rotate + dir * 18,
      scale: 0.72,
      zIndex: from.zIndex + 24,
    };
  }

  // Branding — ikin anash majtas/djathtas
  const dir = index % 2 === 0 ? -1 : 1;
  return {
    x: dir * (vw * 0.95),
    y: from.y - 18,
    rotate: dir * (18 + (index % 3) * 5),
    scale: 0.96,
    zIndex: from.zIndex + 24,
  };
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

export { cardWidth as cardSize };
