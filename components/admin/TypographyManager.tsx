"use client";

import type { TypographyItem } from "@/types/branding";
import { createId } from "@/lib/utils/id";
import { Plus, Trash2 } from "lucide-react";

export function TypographyManager({
  items,
  onChange,
}: {
  items: TypographyItem[];
  onChange: (items: TypographyItem[]) => void;
}) {
  function add() {
    onChange([
      ...items,
      {
        id: createId(),
        role: "custom",
        fontName: "Inter",
        fontWeight: "400",
        sampleText: "Sample text",
      },
    ]);
  }

  function update(id: string, patch: Partial<TypographyItem>) {
    onChange(items.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function remove(id: string) {
    onChange(items.filter((t) => t.id !== id));
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">Typography</h3>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs"
        >
          <Plus size={12} /> Add
        </button>
      </div>
      <div className="space-y-3">
        {items.map((t) => (
          <div key={t.id} className="rounded-lg border border-border bg-surface/60 p-3 space-y-2">
            <div className="flex gap-2">
              <select
                value={t.role}
                onChange={(e) =>
                  update(t.id, { role: e.target.value as TypographyItem["role"] })
                }
                className="rounded border border-border bg-background px-2 py-1.5 text-sm"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="custom">Custom</option>
              </select>
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="ml-auto rounded p-1.5 text-muted hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={t.fontName}
                onChange={(e) => update(t.id, { fontName: e.target.value })}
                placeholder="Font name"
                className="rounded border border-border bg-background px-2 py-1.5 text-sm"
              />
              <input
                value={t.fontWeight}
                onChange={(e) => update(t.id, { fontWeight: e.target.value })}
                placeholder="Weight"
                className="rounded border border-border bg-background px-2 py-1.5 text-sm"
              />
            </div>
            <input
              value={t.sampleText}
              onChange={(e) => update(t.id, { sampleText: e.target.value })}
              placeholder="Sample text"
              className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
