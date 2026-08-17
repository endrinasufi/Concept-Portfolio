/** 7 kolona × 2 rreshta: logoja është fiks, 7 fotot zgjidhen. */
export const MOSAIC_PHOTO_COUNT = 7;

export type MosaicSlot =
  | { type: "photo"; photoIndex: number; className: string }
  | { type: "logo"; className: string };

export const MOSAIC_SLOTS: MosaicSlot[] = [
  { type: "photo", photoIndex: 0, className: "col-start-1 row-start-1" },
  { type: "photo", photoIndex: 1, className: "col-start-2 row-start-1" },
  { type: "logo", className: "col-start-5 row-start-1" },
  { type: "photo", photoIndex: 2, className: "col-start-6 row-start-1" },
  { type: "photo", photoIndex: 3, className: "col-start-1 row-start-2" },
  { type: "photo", photoIndex: 4, className: "col-start-3 row-start-2" },
  { type: "photo", photoIndex: 5, className: "col-start-4 row-start-2" },
  { type: "photo", photoIndex: 6, className: "col-start-7 row-start-2" },
];

export function normalizeMosaicMediaIds(ids?: string[] | null): string[] {
  return Array.from(
    { length: MOSAIC_PHOTO_COUNT },
    (_, i) => ids?.[i]?.trim() || "",
  );
}
