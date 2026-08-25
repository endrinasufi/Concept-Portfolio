"use client";

import { MediaImage } from "@/components/branding/MediaImage";
import { AdminSubNav } from "@/components/admin/AdminSubNav";
import { ClientLogosEditor } from "@/components/admin/ClientLogosEditor";
import { SortableItem, SortableList } from "@/components/admin/SortableList";
import {
  HOME_CARD_CATEGORIES,
  type HomeCardCategoryId,
} from "@/lib/data/categories";
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

type HomeTab = HomeCardCategoryId | "client-logos";

export function HomepageManager() {
  const { settings, loading: settingsLoading, update } = useSiteSettings();
  const branding = useProjects({ service: "branding", includeDrafts: true });
  const social = useSocialMediaProjects({ includeDrafts: true });
  const web = useWebDesignProjects({ includeDrafts: true });
  const [tab, setTab] = useState<HomeTab>("branding");
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

  const navItems = [
    ...HOME_CARD_CATEGORIES.map((cat) => ({
      id: cat.id,
      label: cat.label,
      hint: `${settings.homeFeatured?.[cat.id]?.length ?? 0}/${homeFeaturedLimit(cat.id)}`,
    })),
    {
      id: "client-logos",
      label: "Client logos",
      hint: String(settings.clientLogos?.length ?? 0),
    },
  ];

  const activeCategory =
    tab === "client-logos" ? null : (tab as HomeCardCategoryId);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1>Homepage</h1>
          <p>
            Featured projects per category and the client logos band on the
            homepage.
          </p>
        </div>
        <p className="text-xs text-muted">
          {saving ? "Saving…" : uploadingId ? "Uploading photo…" : " "}
        </p>
      </div>
      {thumbError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {thumbError}
        </p>
      ) : null}

      <div className="flex flex-col gap-5 lg:flex-row lg:gap-8">
        <aside className="w-full shrink-0 lg:w-48">
          <AdminSubNav
            title="Homepage"
            items={navItems}
            active={tab}
            onChange={(id) => {
              setTab(id as HomeTab);
              setQuery("");
              setThumbError(null);
            }}
          />
        </aside>

        <div className="min-w-0 flex-1">
          {tab === "client-logos" ? (
            <ClientLogosEditor />
          ) : loading || !activeCategory ? (
            <p className="text-sm text-muted">Loading projects…</p>
          ) : (
            <FeaturedCategoryPanel
              active={activeCategory}
              catalog={catalogs[activeCategory]}
              picks={settings.homeFeatured?.[activeCategory] ?? []}
              query={query}
              setQuery={setQuery}
              uploadingId={uploadingId}
              onPatch={(items) => patchCategory(activeCategory, items)}
              onThumbError={setThumbError}
              setUploadingId={setUploadingId}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function FeaturedCategoryPanel({
  active,
  catalog,
  picks,
  query,
  setQuery,
  uploadingId,
  onPatch,
  onThumbError,
  setUploadingId,
}: {
  active: HomeCardCategoryId;
  catalog: CatalogItem[];
  picks: HomeFeaturedItem[];
  query: string;
  setQuery: (q: string) => void;
  uploadingId: string | null;
  onPatch: (items: HomeFeaturedItem[]) => void;
  onThumbError: (msg: string | null) => void;
  setUploadingId: (id: string | null) => void;
}) {
  const limit = homeFeaturedLimit(active);
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
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-2xl bg-white/70 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium">On homepage</h2>
          <span className="text-xs tabular-nums text-muted">
            {picks.length}/{limit}
          </span>
        </div>
        {selectedRows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#1a1a1a]/15 px-4 py-10 text-center text-sm text-muted">
            Add projects from the list on the right. If left empty, published
            projects appear automatically.
          </p>
        ) : (
          <SortableList
            ids={picks.map((p) => p.projectId)}
            onReorder={(ids) => {
              const map = new Map(picks.map((p) => [p.projectId, p]));
              onPatch(
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
                      onPatch(picks.filter((p) => p.projectId !== item.id))
                    }
                    onThumb={(file) => {
                      void (async () => {
                        onThumbError(null);
                        setUploadingId(item.id);
                        try {
                          const asset = await uploadMedia(file);
                          onPatch(
                            picks.map((p) =>
                              p.projectId === item.id
                                ? { ...p, thumbnailMediaId: asset.id }
                                : p,
                            ),
                          );
                        } catch (err) {
                          onThumbError(
                            err instanceof Error
                              ? err.message
                              : "Photo upload failed.",
                          );
                        } finally {
                          setUploadingId(null);
                        }
                      })();
                    }}
                    onClearThumb={() => {
                      const prev = pick.thumbnailMediaId;
                      onPatch(
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
          <h2 className="text-sm font-medium">Add projects</h2>
          {atLimit ? (
            <span className="text-xs text-muted">Limit reached</span>
          ) : null}
        </div>
        <label className="mb-3 flex items-center gap-2 rounded-xl border border-[#1a1a1a]/10 bg-white px-3 py-2">
          <Search size={14} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title or client"
            className="w-full bg-transparent p-0 text-sm outline-none"
            style={{ border: "none", boxShadow: "none", borderRadius: 0 }}
          />
        </label>
        {available.length === 0 ? (
          <p className="px-1 py-8 text-center text-sm text-muted">
            {catalog.length === 0
              ? "No projects in this category."
              : "All selected, or search has no results."}
          </p>
        ) : (
          <ul className="max-h-[28rem] space-y-1 overflow-auto pr-1">
            {available.map((item) => (
              <li key={item.id}>
                <div className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="truncate text-[11px] text-muted">
                      {item.client || "No client"}
                      {item.status !== "published" ? " · draft" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={atLimit}
                    onClick={() =>
                      onPatch([...picks, { projectId: item.id }])
                    }
                    className="inline-flex items-center gap-1 rounded-full bg-[#1a1a1a] px-2.5 py-1 text-[11px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
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
          {item.client || "No client"}
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
        className="admin-upload-btn disabled:opacity-50"
      >
        <ImagePlus size={11} />
        {uploading ? "Loading…" : hasThumb ? "Change" : "Thumbnail"}
      </button>
      {hasThumb ? (
        <button
          type="button"
          onClick={onClearThumb}
          className="text-[11px] text-muted hover:text-foreground"
        >
          Project photo
        </button>
      ) : null}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-1 text-muted hover:text-red-600"
        aria-label="Remove"
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
