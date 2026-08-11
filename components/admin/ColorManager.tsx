"use client";

import type { BrandColor } from "@/types/branding";
import { createId, sortByOrder } from "@/lib/utils/id";
import { SortableList, SortableItem } from "./SortableList";
import { Plus, Trash2 } from "lucide-react";

export function ColorManager({
  colors,
  onChange,
}: {
  colors: BrandColor[];
  onChange: (colors: BrandColor[]) => void;
}) {
  const sorted = sortByOrder(colors);

  function update(id: string, hex: string) {
    onChange(colors.map((c) => (c.id === id ? { ...c, hex } : c)));
  }

  function add() {
    if (colors.length >= 5) return;
    onChange([
      ...colors,
      { id: createId(), hex: "#888888", order: colors.length },
    ]);
  }

  function remove(id: string) {
    const next = colors
      .filter((c) => c.id !== id)
      .map((c, i) => ({ ...c, order: i }));
    onChange(next);
  }

  function reorder(ids: string[]) {
    onChange(ids.map((id, order) => {
      const c = colors.find((x) => x.id === id)!;
      return { ...c, order };
    }));
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">Ngjyrat e markës (2–5)</h3>
        <button
          type="button"
          onClick={add}
          disabled={colors.length >= 5}
          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs disabled:opacity-40"
        >
          <Plus size={12} /> Shto
        </button>
      </div>
      <SortableList ids={sorted.map((c) => c.id)} onReorder={reorder}>
        <div className="space-y-2">
          {sorted.map((c) => (
            <SortableItem key={c.id} id={c.id} className="pl-8">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-surface/60 p-2">
                <input
                  type="color"
                  value={c.hex}
                  onChange={(e) => update(c.id, e.target.value)}
                  className="h-9 w-9 cursor-pointer rounded border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={c.hex}
                  onChange={(e) => update(c.id, e.target.value)}
                  className="flex-1 rounded border border-border bg-background px-2 py-1.5 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => remove(c.id)}
                  disabled={colors.length <= 2}
                  className="rounded p-1.5 text-muted hover:text-red-400 disabled:opacity-30"
                  aria-label="Fshi ngjyrën"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </SortableItem>
          ))}
        </div>
      </SortableList>
      {colors.length < 2 ? (
        <p className="mt-2 text-xs text-amber-400">Shtoni të paktën 2 ngjyra.</p>
      ) : null}
    </div>
  );
}
