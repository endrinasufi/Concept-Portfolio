export type MapViewBox = { x: number; y: number; w: number; h: number };
export type MapBBox = { minX: number; minY: number; maxX: number; maxY: number };

export function parseViewBox(s: string): MapViewBox {
  const [x, y, w, h] = s.split(/[\s,]+/).map(Number);
  return { x, y, w, h };
}

export function formatViewBox(v: MapViewBox): string {
  return `${v.x} ${v.y} ${v.w} ${v.h}`;
}

function bboxArea(b: MapBBox): number {
  return Math.max(0, b.maxX - b.minX) * Math.max(0, b.maxY - b.minY);
}

function skipSep(d: string, i: number): number {
  while (i < d.length && (d[i] === " " || d[i] === "," || d[i] === "\n" || d[i] === "\t")) {
    i += 1;
  }
  return i;
}

function readNum(d: string, i: number): { value: number; next: number } | null {
  i = skipSep(d, i);
  if (i >= d.length) return null;
  const start = i;
  if (d[i] === "+" || d[i] === "-") i += 1;
  let seenDigit = false;
  while (i < d.length && d[i] >= "0" && d[i] <= "9") {
    seenDigit = true;
    i += 1;
  }
  if (i < d.length && d[i] === ".") {
    i += 1;
    while (i < d.length && d[i] >= "0" && d[i] <= "9") {
      seenDigit = true;
      i += 1;
    }
  }
  if (i < d.length && (d[i] === "e" || d[i] === "E")) {
    i += 1;
    if (d[i] === "+" || d[i] === "-") i += 1;
    while (i < d.length && d[i] >= "0" && d[i] <= "9") i += 1;
  }
  if (!seenDigit) return null;
  return { value: Number(d.slice(start, i)), next: i };
}

export function pathBBox(d: string): MapBBox | null {
  let i = 0;
  let cmd = "";
  let cx = 0;
  let cy = 0;
  let startX = 0;
  let startY = 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const add = (x: number, y: number) => {
    cx = x;
    cy = y;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  };

  const num = (): number | null => {
    const r = readNum(d, i);
    if (!r) return null;
    i = r.next;
    return r.value;
  };

  while (i < d.length) {
    i = skipSep(d, i);
    if (i >= d.length) break;
    const ch = d[i];
    if ((ch >= "A" && ch <= "Z") || (ch >= "a" && ch <= "z")) {
      cmd = ch;
      i += 1;
      if (cmd === "Z" || cmd === "z") {
        cx = startX;
        cy = startY;
      }
      continue;
    }
    if (!cmd) {
      i += 1;
      continue;
    }
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    if (C === "M" || C === "L" || C === "T") {
      const x = num();
      const y = num();
      if (x == null || y == null) break;
      add(rel ? cx + x : x, rel ? cy + y : y);
      if (C === "M") {
        startX = cx;
        startY = cy;
        cmd = rel ? "l" : "L";
      }
    } else if (C === "H") {
      const x = num();
      if (x == null) break;
      add(rel ? cx + x : x, cy);
    } else if (C === "V") {
      const y = num();
      if (y == null) break;
      add(cx, rel ? cy + y : y);
    } else if (C === "C") {
      const x1 = num();
      const y1 = num();
      const x2 = num();
      const y2 = num();
      const x = num();
      const y = num();
      if (x1 == null || y1 == null || x2 == null || y2 == null || x == null || y == null) {
        break;
      }
      add(rel ? cx + x : x, rel ? cy + y : y);
    } else if (C === "S" || C === "Q") {
      const x1 = num();
      const y1 = num();
      const x = num();
      const y = num();
      if (x1 == null || y1 == null || x == null || y == null) break;
      add(rel ? cx + x : x, rel ? cy + y : y);
    } else if (C === "A") {
      num();
      num();
      num();
      num();
      num();
      const x = num();
      const y = num();
      if (x == null || y == null) break;
      add(rel ? cx + x : x, rel ? cy + y : y);
    } else {
      i += 1;
    }
  }

  if (!Number.isFinite(minX)) return null;
  return { minX, minY, maxX, maxY };
}

/** Përdor path-in më të madh (toka kryesore), jo ishujt e largët. */
export function largestPathBBoxByCountry(
  paths: { id: string; d: string }[],
): Map<string, MapBBox> {
  const map = new Map<string, MapBBox>();
  for (const p of paths) {
    const b = pathBBox(p.d);
    if (!b) continue;
    const prev = map.get(p.id);
    if (!prev || bboxArea(b) > bboxArea(prev)) map.set(p.id, b);
  }
  return map;
}

export function fitCountryViewBox(bbox: MapBBox, world: MapViewBox): MapViewBox {
  const pad = 0.7;
  const aspect = world.w / world.h;
  let w = (bbox.maxX - bbox.minX) * (1 + pad);
  let h = (bbox.maxY - bbox.minY) * (1 + pad);
  const minW = 48;
  w = Math.max(w, minW);
  h = Math.max(h, minW / aspect);
  if (w / h > aspect) h = w / aspect;
  else w = h * aspect;
  let x = (bbox.minX + bbox.maxX) / 2 - w / 2;
  let y = (bbox.minY + bbox.maxY) / 2 - h / 2;
  const slack = 12;
  x = Math.min(Math.max(x, world.x - slack), world.x + world.w - w + slack);
  y = Math.min(Math.max(y, world.y - slack), world.y + world.h - h + slack);
  return { x, y, w, h };
}

export function lerpViewBox(
  from: MapViewBox,
  to: MapViewBox,
  t: number,
): MapViewBox {
  const e = 1 - (1 - t) ** 3;
  return {
    x: from.x + (to.x - from.x) * e,
    y: from.y + (to.y - from.y) * e,
    w: from.w + (to.w - from.w) * e,
    h: from.h + (to.h - from.h) * e,
  };
}
