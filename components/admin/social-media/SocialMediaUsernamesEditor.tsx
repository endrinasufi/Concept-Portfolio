"use client";

import type { SocialMediaUsername } from "@/types/social-media";
import { SortableList, SortableItem } from "@/components/admin/SortableList";
import { createId } from "@/lib/utils/id";
import {
  SOCIAL_MEDIA_NETWORKS,
  networkFromUrl,
  resolveNetwork,
} from "@/lib/social-media/networks";
import { SocialNetworkIcon } from "@/components/social-media/SocialNetworkIcon";
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
        label: "klienti",
        url: "https://instagram.com/klienti",
        network: "instagram",
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
          {ordered.map((handle) => {
            const network = resolveNetwork(handle);
            return (
              <SortableItem key={handle.id} id={handle.id} className="pl-9">
                <div className="grid gap-2 rounded-xl border border-border bg-surface/40 p-3 sm:grid-cols-[auto_1fr_1fr_auto]">
                  <label className="flex items-center gap-2">
                    <span className="text-foreground">
                      <SocialNetworkIcon network={network} />
                    </span>
                    <select
                      value={network}
                      onChange={(e) =>
                        update(handle.id, {
                          network: e.target.value as SocialMediaUsername["network"],
                        })
                      }
                      className="min-w-[8.5rem] rounded-lg border border-border bg-background px-2 py-2 text-sm"
                    >
                      {SOCIAL_MEDIA_NETWORKS.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <input
                    value={handle.label}
                    onChange={(e) => update(handle.id, { label: e.target.value })}
                    placeholder="emri"
                    className="rounded-lg border border-border bg-background px-2 py-2 text-sm"
                  />
                  <input
                    value={handle.url}
                    onChange={(e) => {
                      const url = e.target.value;
                      const detected = networkFromUrl(url);
                      update(handle.id, {
                        url,
                        ...(handle.network || !detected ? {} : { network: detected }),
                      });
                    }}
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
            );
          })}
        </div>
      </SortableList>
    </div>
  );
}
