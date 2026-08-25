"use client";

import type { SocialMediaUsername } from "@/types/social-media";
import { SortableList, SortableItem } from "@/components/admin/SortableList";
import { createId } from "@/lib/utils/id";
import { Plus, Trash2 } from "lucide-react";

export function SocialMediaUsernamesEditor({
  usernames,
  onChange,
}: {
  usernames: SocialMediaUsername[];
  onChange: (next: SocialMediaUsername[]) => void;
}) {
  const ordered = [...usernames].sort((a, b) => a.order - b.order);

  function update(id: string, patch: Partial<SocialMediaUsername>) {
    onChange(ordered.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  function add() {
    onChange([
      ...ordered,
      {
        id: createId(),
        label: "@username",
        url: "https://",
        order: ordered.length,
      },
    ]);
  }

  function remove(id: string) {
    onChange(
      ordered.filter((u) => u.id !== id).map((u, i) => ({ ...u, order: i })),
    );
  }

  function reorder(ids: string[]) {
    const map = new Map(ordered.map((u) => [u.id, u]));
    onChange(ids.map((id, i) => ({ ...map.get(id)!, order: i })));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Usernames / handles</h3>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs"
        >
          <Plus size={12} /> Add
        </button>
      </div>
      <SortableList ids={ordered.map((u) => u.id)} onReorder={reorder}>
        <div className="space-y-2">
          {ordered.map((handle) => (
            <SortableItem key={handle.id} id={handle.id} className="pl-9">
              <div className="grid gap-2 rounded-xl border border-border bg-surface/40 p-3 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  value={handle.label}
                  onChange={(e) => update(handle.id, { label: e.target.value })}
                  placeholder="@username"
                  className="rounded-lg border border-border bg-background px-2 py-2 text-sm"
                />
                <input
                  value={handle.url}
                  onChange={(e) => update(handle.id, { url: e.target.value })}
                  placeholder="https://"
                  className="rounded-lg border border-border bg-background px-2 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => remove(handle.id)}
                  className="inline-flex items-center justify-center rounded-lg border border-red-500/30 px-2 py-2 text-xs text-red-400"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </SortableItem>
          ))}
        </div>
      </SortableList>
    </div>
  );
}
