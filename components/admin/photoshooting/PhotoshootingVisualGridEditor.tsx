"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  GridColSpan,
  GridRowSpan,
  PhotoshootingCell,
} from "@/types/photoshooting";
import { createId } from "@/lib/utils/id";
import { uploadMedia } from "@/lib/media";
import { useResolvedSrc } from "@/lib/hooks/useMediaUrl";
import {
  PS_COL_CLASS,
  PS_GRID_CLASS,
  PS_ROW_CLASS,
} from "@/lib/photoshooting/gridLayout";
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Trash2,
  Upload,
} from "lucide-react";

const DESIGN_WIDTH = 1120;

const SIZE_PRESETS: {
  label: string;
  colSpan: GridColSpan;
  rowSpan: GridRowSpan;
}[] = [
  { label: "1×2", colSpan: 1, rowSpan: 2 },
  { label: "1×3", colSpan: 1, rowSpan: 3 },
  { label: "2×2", colSpan: 2, rowSpan: 2 },
  { label: "2×3", colSpan: 2, rowSpan: 3 },
  { label: "3×3", colSpan: 3, rowSpan: 3 },
  { label: "1×1", colSpan: 1, rowSpan: 1 },
  { label: "2×1", colSpan: 2, rowSpan: 1 },
  { label: "3×2", colSpan: 3, rowSpan: 2 },
];

type TemplateCell = {
  colSpan: GridColSpan;
  rowSpan: GridRowSpan;
};

const LAYOUT_TEMPLATES: {
  id: string;
  label: string;
  cells: TemplateCell[];
}[] = [
  {
    id: "editorial",
    label: "Editorial",
    cells: [
      { colSpan: 2, rowSpan: 3 },
      { colSpan: 2, rowSpan: 3 },
      { colSpan: 2, rowSpan: 2 },
      { colSpan: 1, rowSpan: 1 },
      { colSpan: 1, rowSpan: 1 },
      { colSpan: 2, rowSpan: 2 },
      { colSpan: 1, rowSpan: 2 },
      { colSpan: 1, rowSpan: 2 },
      { colSpan: 2, rowSpan: 2 },
      { colSpan: 2, rowSpan: 3 },
      { colSpan: 1, rowSpan: 1 },
      { colSpan: 1, rowSpan: 1 },
      { colSpan: 2, rowSpan: 2 },
      { colSpan: 2, rowSpan: 3 },
    ],
  },
  {
    id: "lookbook",
    label: "Lookbook",
    cells: [
      { colSpan: 3, rowSpan: 3 },
      { colSpan: 1, rowSpan: 1 },
      { colSpan: 2, rowSpan: 1 },
      { colSpan: 1, rowSpan: 2 },
      { colSpan: 2, rowSpan: 2 },
      { colSpan: 2, rowSpan: 3 },
      { colSpan: 2, rowSpan: 3 },
      { colSpan: 2, rowSpan: 1 },
      { colSpan: 2, rowSpan: 1 },
      { colSpan: 2, rowSpan: 1 },
      { colSpan: 1, rowSpan: 3 },
      { colSpan: 1, rowSpan: 3 },
      { colSpan: 2, rowSpan: 3 },
      { colSpan: 2, rowSpan: 3 },
      { colSpan: 2, rowSpan: 2 },
      { colSpan: 1, rowSpan: 1 },
      { colSpan: 1, rowSpan: 1 },
      { colSpan: 1, rowSpan: 1 },
      { colSpan: 1, rowSpan: 1 },
      { colSpan: 2, rowSpan: 2 },
    ],
  },
  {
    id: "mozaik",
    label: "Mozaik",
    cells: [
      { colSpan: 2, rowSpan: 3 },
      { colSpan: 2, rowSpan: 3 },
      { colSpan: 2, rowSpan: 1 },
      { colSpan: 2, rowSpan: 1 },
      { colSpan: 1, rowSpan: 1 },
      { colSpan: 1, rowSpan: 1 },
      { colSpan: 2, rowSpan: 2 },
      { colSpan: 1, rowSpan: 2 },
      { colSpan: 1, rowSpan: 2 },
      { colSpan: 2, rowSpan: 2 },
      { colSpan: 1, rowSpan: 3 },
      { colSpan: 2, rowSpan: 3 },
      { colSpan: 1, rowSpan: 3 },
      { colSpan: 2, rowSpan: 3 },
    ],
  },
];

function makePhoto(partial?: Partial<PhotoshootingCell>): PhotoshootingCell {
  return {
    id: createId(),
    type: "photo",
    order: 0,
    colSpan: 2,
    rowSpan: 3,
    ...partial,
  };
}

function fromTemplate(templateId: string): PhotoshootingCell[] {
  const t = LAYOUT_TEMPLATES.find((x) => x.id === templateId);
  if (!t) return [];
  return t.cells.map((c, i) =>
    makePhoto({
      order: i,
      colSpan: c.colSpan,
      rowSpan: c.rowSpan,
    }),
  );
}

function CellVisual({ cell }: { cell: PhotoshootingCell }) {
  const src = useResolvedSrc({ mediaId: cell.mediaId, imageUrl: cell.imageUrl });

  return (
    <div className="relative h-full w-full overflow-hidden bg-surface">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted">
          <ImagePlus size={20} />
          <span className="text-[11px]">Kliko për foto</span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/45 group-hover:opacity-100">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-medium text-black">
          <Upload size={12} />
          Ndrysho foto
        </span>
      </div>
    </div>
  );
}

type Props = {
  cells: PhotoshootingCell[];
  onChange: (cells: PhotoshootingCell[]) => void;
};

export function PhotoshootingVisualGridEditor({ cells, onChange }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [scale, setScale] = useState(0.62);
  const [scaledHeight, setScaledHeight] = useState<number | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);
  const multiFileRef = useRef<HTMLInputElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  /** Qeliza ku do të shkojë upload-i (klik ose buton). */
  const uploadTargetId = useRef<string | null>(null);

  const photoCells = useMemo(
    () => cells.filter((c) => c.type === "photo"),
    [cells],
  );

  const selected = useMemo(
    () => photoCells.find((c) => c.id === selectedId) ?? null,
    [photoCells, selectedId],
  );
  const selectedIndex = selectedId
    ? photoCells.findIndex((c) => c.id === selectedId)
    : -1;

  useEffect(() => {
    if (selectedId && !photoCells.some((c) => c.id === selectedId)) {
      setSelectedId(photoCells[0]?.id ?? null);
    }
  }, [photoCells, selectedId]);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const sync = () => {
      const nextScale = Math.min(1, outer.clientWidth / DESIGN_WIDTH);
      setScale(nextScale);
      setScaledHeight(inner.offsetHeight * nextScale);
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(outer);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [photoCells]);

  function setCells(next: PhotoshootingCell[]) {
    onChange(
      next
        .filter((c) => c.type === "photo")
        .map((c, i) => ({ ...c, type: "photo" as const, order: i })),
    );
  }

  function updateCell(id: string, partial: Partial<PhotoshootingCell>) {
    setCells(photoCells.map((c) => (c.id === id ? { ...c, ...partial } : c)));
  }

  function updateSelected(partial: Partial<PhotoshootingCell>) {
    if (!selectedId) return;
    updateCell(selectedId, partial);
  }

  function addPhoto() {
    const cell = makePhoto({ order: photoCells.length });
    setCells([...photoCells, cell]);
    setSelectedId(cell.id);
  }

  function removeSelected() {
    if (!selectedId) return;
    const idx = photoCells.findIndex((c) => c.id === selectedId);
    const next = photoCells.filter((c) => c.id !== selectedId);
    setCells(next);
    setSelectedId(next[Math.max(0, idx - 1)]?.id ?? next[0]?.id ?? null);
  }

  function moveSelected(dir: -1 | 1) {
    if (selectedIndex < 0) return;
    const target = selectedIndex + dir;
    if (target < 0 || target >= photoCells.length) return;
    const next = [...photoCells];
    const [item] = next.splice(selectedIndex, 1);
    next.splice(target, 0, item);
    setCells(next);
  }

  function applyTemplate(templateId: string) {
    if (photoCells.length > 0) {
      const ok = window.confirm(
        "Layout-i i ri zëvendëson fotot aktuale. Vazhdon?",
      );
      if (!ok) return;
    }
    const next = fromTemplate(templateId);
    setCells(next);
    setSelectedId(next[0]?.id ?? null);
  }

  async function assignFileToCell(cellId: string, file: File) {
    if (!file.type.startsWith("image/")) return;
    setBusy(true);
    try {
      const asset = await uploadMedia(file);
      updateCell(cellId, { mediaId: asset.id, imageUrl: undefined });
    } finally {
      setBusy(false);
    }
  }

  async function addPhotosFromFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (!files.length) return;
    setBusy(true);
    try {
      const created: PhotoshootingCell[] = [];
      for (const file of files) {
        const asset = await uploadMedia(file);
        created.push(
          makePhoto({
            mediaId: asset.id,
            colSpan: 2,
            rowSpan: 3,
          }),
        );
      }
      const next = [...photoCells, ...created];
      setCells(next);
      setSelectedId(created[created.length - 1]?.id ?? selectedId);
    } finally {
      setBusy(false);
    }
  }

  function openFilePicker(cellId: string) {
    setSelectedId(cellId);
    uploadTargetId.current = cellId;
    fileRef.current?.click();
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted">
            Grid foto
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            Kliko një foto për ta ndryshuar. Dominancë vertikale.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {LAYOUT_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => applyTemplate(t.id)}
              className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted hover:text-foreground"
            >
              {t.label}
            </button>
          ))}
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] hover:bg-white/5">
            <Upload size={12} />
            {busy ? "…" : "Shto foto"}
            <input
              ref={multiFileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) void addPhotosFromFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>

      <div
        ref={outerRef}
        className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-[#0a0b0d] p-2"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setDragOverId(null);
          const files = e.dataTransfer.files;
          if (!files?.length) return;
          if (selectedId && files.length === 1) {
            void assignFileToCell(selectedId, files[0]);
            return;
          }
          void addPhotosFromFiles(files);
        }}
      >
        {photoCells.length === 0 ? (
          <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 text-center">
            <ImagePlus size={20} className="text-muted" />
            <p className="text-xs text-muted">Zgjidh layout ose shto foto</p>
          </div>
        ) : (
          <div style={{ height: scaledHeight }}>
            <div
              ref={innerRef}
              className="origin-top-left"
              style={{
                width: DESIGN_WIDTH,
                transform: `scale(${scale})`,
              }}
            >
              <div className={`${PS_GRID_CLASS} p-1`}>
                {photoCells.map((cell) => {
                  const col = PS_COL_CLASS[cell.colSpan] ?? PS_COL_CLASS[2];
                  const row = PS_ROW_CLASS[cell.rowSpan] ?? PS_ROW_CLASS[1];
                  const isSelected = cell.id === selectedId;
                  const over = cell.id === dragOverId;

                  return (
                    <button
                      key={cell.id}
                      type="button"
                      onClick={() => openFilePicker(cell.id)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOverId(cell.id);
                      }}
                      onDragLeave={() =>
                        setDragOverId((id) => (id === cell.id ? null : id))
                      }
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOverId(null);
                        const file = e.dataTransfer.files?.[0];
                        if (!file) return;
                        setSelectedId(cell.id);
                        void assignFileToCell(cell.id, file);
                      }}
                      className={`group ${col} ${row} relative h-full overflow-hidden rounded-[1.25rem] text-left transition md:rounded-[1.5rem] ${
                        isSelected
                          ? "ring-2 ring-accent ring-offset-2 ring-offset-[#0a0b0d]"
                          : "ring-1 ring-white/10 hover:ring-white/25"
                      } ${over ? "ring-2 ring-accent/80" : ""}`}
                    >
                      <CellVisual cell={cell} />
                      <span className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-white/70">
                        {cell.colSpan}×{cell.rowSpan}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={addPhoto}
          className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1.5 text-[11px] hover:bg-white/15"
        >
          <ImagePlus size={12} /> Foto bosh
        </button>
      </div>

      {selected ? (
        <div className="rounded-2xl border border-border bg-surface/40 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted">
              Foto · {selected.colSpan}×{selected.rowSpan}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={selectedIndex <= 0}
                onClick={() => moveSelected(-1)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border disabled:opacity-30"
                aria-label="Lëviz majtas"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                disabled={
                  selectedIndex < 0 || selectedIndex >= photoCells.length - 1
                }
                onClick={() => moveSelected(1)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border disabled:opacity-30"
                aria-label="Lëviz djathtas"
              >
                <ChevronRight size={14} />
              </button>
              <button
                type="button"
                onClick={removeSelected}
                className="inline-flex items-center gap-1 rounded-full border border-red-400/30 px-2 py-1 text-[11px] text-red-300/90"
              >
                <Trash2 size={12} /> Fshi
              </button>
            </div>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1">
            {SIZE_PRESETS.map((p) => {
              const active =
                selected.colSpan === p.colSpan &&
                selected.rowSpan === p.rowSpan;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() =>
                    updateSelected({
                      colSpan: p.colSpan,
                      rowSpan: p.rowSpan,
                    })
                  }
                  className={`rounded-full px-2.5 py-1 text-[11px] ${
                    active
                      ? "bg-foreground text-background"
                      : "border border-border text-muted hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => openFilePicker(selected.id)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] hover:bg-white/5 disabled:opacity-50"
            >
              <Upload size={12} />
              {busy ? "Duke ngarkuar…" : "Ndrysho foto"}
            </button>
            <input
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs outline-none focus:border-accent"
              value={selected.imageUrl ?? ""}
              onChange={(e) =>
                updateSelected({
                  imageUrl: e.target.value,
                  mediaId: e.target.value ? undefined : selected.mediaId,
                })
              }
              placeholder="ose vendos URL…"
            />
          </div>
        </div>
      ) : null}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          const target = uploadTargetId.current ?? selectedId;
          if (file && target) void assignFileToCell(target, file);
          e.target.value = "";
          uploadTargetId.current = null;
        }}
      />
    </section>
  );
}
