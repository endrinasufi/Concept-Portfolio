"use client";

import { useCallback, useEffect, useState } from "react";
import { getMediaRepository } from "@/lib/repositories";
import type { MediaAsset } from "@/types/media";
import { uploadMedia } from "@/lib/media";
import { MediaImage } from "@/components/branding/MediaImage";

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const list = await getMediaRepository().list();
    setItems(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const list = await getMediaRepository().list();
      if (cancelled) return;
      setItems(list);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Media</h1>
          <p className="mt-1 text-sm text-muted">
            Skedarët ruhen lokalisht në IndexedDB (V1).
          </p>
        </div>
        <label className="cursor-pointer rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">
          Ngarko
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (!files) return;
              void (async () => {
                for (const f of Array.from(files)) {
                  await uploadMedia(f);
                }
                await refresh();
              })();
            }}
          />
        </label>
      </div>

      {loading ? (
        <p className="text-muted">Duke ngarkuar…</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-lg border border-border bg-surface/50"
            >
              <MediaImage
                mediaId={item.id}
                alt={item.filename}
                className="aspect-square w-full object-cover"
              />
              <div className="p-2">
                <p className="truncate text-xs">{item.filename}</p>
                <button
                  type="button"
                  className="mt-1 text-[10px] text-red-400"
                  onClick={() =>
                    void getMediaRepository()
                      .delete(item.id)
                      .then(refresh)
                  }
                >
                  Fshi
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !items.length ? (
        <p className="text-muted">Nuk ka media të ngarkuar ende.</p>
      ) : null}
    </div>
  );
}
