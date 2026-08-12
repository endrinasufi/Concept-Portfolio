/** Layout i përbashkët — faqja publike dhe editori admin. */
export const PS_COL_CLASS: Record<number, string> = {
  1: "col-span-2 sm:col-span-1",
  2: "col-span-2",
  3: "col-span-2 sm:col-span-3",
  4: "col-span-2 sm:col-span-4",
  6: "col-span-2 sm:col-span-6",
};

export const PS_ROW_CLASS: Record<number, string> = {
  1: "row-span-1 min-h-[140px] sm:min-h-[160px]",
  2: "row-span-2 min-h-[290px] sm:min-h-[330px]",
  3: "row-span-3 min-h-[440px] sm:min-h-[500px]",
};

/** dense = mbush vrimat e bento-s. */
export const PS_GRID_CLASS =
  "grid grid-flow-dense grid-cols-2 gap-3 [grid-auto-rows:minmax(140px,auto)] sm:grid-cols-6 sm:gap-4 sm:[grid-auto-rows:minmax(160px,auto)] md:gap-5";
