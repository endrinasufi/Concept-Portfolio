"use client";

import { MediaImage } from "@/components/branding/MediaImage";
import { SortableItem, SortableList } from "@/components/admin/SortableList";
import { HOME_CARD_CATEGORIES, type HomeCardCategoryId } from "@/lib/data/categories";
import { homeFeaturedLimit } from "@/lib/home/pickFeatured";
import { useProjects } from "@/lib/hooks/useProjects";
import { useSiteSettings } from "@/lib/hooks/useSiteSettings";
import { useSocialMediaProjects } from "@/lib/hooks/useSocialMediaProjects";
import { useWebDesignProjects } from "@/lib/hooks/useWebDesignProjects";
import { deleteMedia, uploadMedia } from "@/lib/media";
import type { HomeFeatured, HomeFeaturedItem } from "@/types/settings";
import { ImagePlus, Plus, Search, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";

type CatalogItem = {
  id: string;
  title: string;
  client?: string;
  status: string;
};

export function HomepageManager() {
  const { settings, loading: settingsLoading, update } = useSiteSettings();
  const branding = useProjects({ service: "branding", includeDrafts: true });
  const social = useSocialMediaProjects({ includeDrafts: true });
  const web = useWebDesignProjects({ includeDrafts: true });
  const [active, setActive] = useState<HomeCardCategoryId>("branding");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [thumbError, setThumbError] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const catalogs = useMemo<Record<HomeCardCategoryId, CatalogItem[]>>(
    () => ({
      branding: branding.projects.map((p) => ({
        id: p.id,
        title: p.title,
        client: p.client,
        status: p.status,
      })),
      "social-media": social.projects.map((p) => ({
        id: p.id,
        title: p.title,
        client: p.clientName,
        status: p.status,
      })),
      "web-design": web.projects.map((p) => ({
        id: p.id,
        title: p.title,
        client: p.client,
        status: p.status,
      })),
    }),
    [branding.projects, social.projects, web.projects],
  );

  const loading =
    settingsLoading || branding.loading || social.loading || web.loading;

  async function save(next: HomeFeatured) {
    setSaving(true);
    try {
      await update({ homeFeatured: next });
    } finally {
      setSaving(false);
    }
  }

  function patchCategory(id: HomeCardCategoryId, items: HomeFeaturedItem[]) {
    void save({
      ...settings.homeFeatured,
      [id]: items.slice(0, homeFeaturedLimit(id)),
    });
  }

  const catalog = catalogs[active];
  const limit = homeFeaturedLimit(active);
  const picks = settings.homeFeatured?.[active] ?? [];
  const selectedIds = new Set(picks.map((p) => p.projectId));
  const atLimit = picks.length >= limit;
  const selectedRows = picks
    .map((pick) => ({
      pick,
      item: catalog.find((c) => c.id === pick.projectId),
    }))
    .filter(
      (row): row is { pick: HomeFeaturedItem; item: CatalogItem } =>
        Boolean(row.item),
    );
  const available = catalog.filter((item) => {
    if (selectedIds.has(item.id)) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      (item.client || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1>Homepage</h1>
          <p>
            Branding mban 6 karta projekti, Social Media dhe Web Design nga 8 —
            sa shfaqen në homepage.
          </p>
        </div>
        <p className="text-xs text-muted">
          {saving ? "Duke ruajtur…" : uploadingId ? "Duke ngarkuar foton…" : " "}
        </p>
      </div>
      {thumbError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {thumbError}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-1.5">
        {HOME_CARD_CATEGORIES.map((cat) => {
          const count = settings.homeFeatured?.[cat.id]?.length ?? 0;
          const on = active === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActive(cat.id);
                setQuery("");
              }}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                on
                  ? "bg-[#1a1a1a] text-white"
                  : "bg-white/70 text-muted hover:text-foreground"
              }`}
            >
              {cat.label}
              <span className={`ml-1.5 tabular-nums ${on ? "text-white/55" : ""}`}>
                {count}/{homeFeaturedLimit(cat.id)}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="text-sm text-muted">Duke ngarkuar projektet…</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl bg-white/70 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium">Në homepage</h2>
              <span className="text-xs tabular-nums text-muted">
                {picks.length}/{limit}
              </span>
            </div>
            {selectedRows.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#1a1a1a]/15 px-4 py-10 text-center text-sm text-muted">
                Shto projekte nga lista djathtas. Nëse lihet bosh, dalin
                automatikisht të publikuarat.
              </p>
            ) : (
              <SortableList
                ids={picks.map((p) => p.projectId)}
                onReorder={(ids) => {
                  const map = new Map(picks.map((p) => [p.projectId, p]));
                  patchCategory(
                    active,
                    ids
                      .map((id) => map.get(id))
                      .filter(Boolean) as HomeFeaturedItem[],
                  );
                }}
              >
                <ol className="space-y-1.5">
                  {selectedRows.map(({ pick, item }, index) => (
                    <SortableItem key={item.id} id={item.id}>
                      <SelectedRow
                        index={index + 1}
                        item={item}
                        pick={pick}
                        uploading={uploadingId === item.id}
                        onRemove={() =>
                          patchCategory(
                            active,
                            picks.filter((p) => p.projectId !== item.id),
                          )
                        }
                        onThumb={(file) => {
                          void (async () => {
                            setThumbError(null);
                            setUploadingId(item.id);
                            try {
                              const asset = await uploadMedia(file);
                              patchCategory(
                                active,
                                picks.map((p) =>
                                  p.projectId === item.id
                                    ? { ...p, thumbnailMediaId: asset.id }
                                    : p,
                                ),
                              );
                            } catch (err) {
                              setThumbError(
                                err instanceof Error
                                  ? err.message
                                  : "Ngarkimi i fotos dështoi.",
                              );
                            } finally {
                              setUploadingId(null);
                            }
                          })();
                        }}
                        onClearThumb={() => {
                          const prev = pick.thumbnailMediaId;
                          patchCategory(
                            active,
                            picks.map((p) =>
                              p.projectId === item.id
                                ? { projectId: p.projectId }
                                : p,
                            ),
                          );
                          if (prev) void deleteMedia(prev).catch(() => undefined);
                        }}
                      />
                    </SortableItem>
                  ))}
                </ol>
              </SortableList>
            )}
          </section>

          <section className="rounded-2xl bg-white/70 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium">Shto projekte</h2>
              {atLimit ? (
                <span className="text-xs text-muted">Limiti u mbush</span>
              ) : null}
            </div>
            <label className="mb-3 flex items-center gap-2 rounded-xl border border-[#1a1a1a]/10 bg-white px-3 py-2">
              <Search size={14} className="text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Kërko titull ose klient"
                className="w-full bg-transparent p-0 text-sm outline-none"
                style={{ border: "none", boxShadow: "none", borderRadius: 0 }}
              />
            </label>
            {available.length === 0 ? (
              <p className="px-1 py-8 text-center text-sm text-muted">
                {catalog.length === 0
                  ? "Nuk ka projekte në këtë kategori."
                  : "Të gjitha janë zgjedhur, ose kërkimi s’ka rezultat."}
              </p>
            ) : (
              <ul className="max-h-[28rem] space-y-1 overflow-auto pr-1">
                {available.map((item) => (
                  <li key={item.id}>
                    <div className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        <p className="truncate text-[11px] text-muted">
                          {item.client || "Pa klient"}
                          {item.status !== "published" ? " · draft" : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={atLimit}
                        onClick={() =>
                          patchCategory(active, [
                            ...picks,
                            { projectId: item.id },
                          ])
                        }
                        className="inline-flex items-center gap-1 rounded-full bg-[#1a1a1a] px-2.5 py-1 text-[11px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <Plus size={12} /> Shto
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function SelectedRow({
  index,
  item,
  pick,
  uploading,
  onThumb,
  onClearThumb,
  onRemove,
}: {
  index: number;
  item: CatalogItem;
  pick: HomeFeaturedItem;
  uploading?: boolean;
  onThumb: (file: File) => void;
  onClearThumb: () => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasThumb = Boolean(pick.thumbnailMediaId);

  return (
    <div className="flex items-center gap-3 rounded-xl bg-white py-2 pr-2 pl-8">
      <span className="w-5 shrink-0 text-xs tabular-nums text-muted">{index}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.title}</p>
        <p className="truncate text-[11px] text-muted">
          {item.client || "Pa klient"}
          {item.status !== "published" ? " · draft" : ""}
        </p>
      </div>
      {hasThumb ? (
        <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-sm border border-[#1a1a1a]/10">
          <MediaImage
            mediaId={pick.thumbnailMediaId}
            alt=""
            fit="cover"
            className="h-full w-full"
          />
        </span>
      ) : null}
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1 rounded-full border border-[#1a1a1a]/12 px-2 py-1 text-[11px] text-muted hover:text-foreground disabled:opacity-50"
      >
        <ImagePlus size={11} />
        {uploading ? "Duke ngarkuar…" : hasThumb ? "Ndrysho" : "Thumbnail"}
      </button>
      {hasThumb ? (
        <button
          type="button"
          onClick={onClearThumb}
          className="text-[11px] text-muted hover:text-foreground"
        >
          Foto projekti
        </button>
      ) : null}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-1 text-muted hover:text-red-600"
        aria-label="Hiq"
      >
        <X size={14} />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onThumb(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
