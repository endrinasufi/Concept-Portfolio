"use client";

import type { WebDesignFeaturedVisual } from "@/types/web-design";
import { WEB_DESIGN_FEATURED_FRAMES } from "@/types/web-design";
import { MediaImage } from "@/components/branding/MediaImage";
import { uploadWebDesignAsset } from "@/lib/web-design/media";

const field =
  "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";
const label = "block text-xs uppercase tracking-[0.16em] text-muted";

export function WebDesignFeaturedVisualEditor({
  value,
  onChange,
}: {
  value: WebDesignFeaturedVisual;
  onChange: (next: WebDesignFeaturedVisual) => void;
}) {
  async function upload(
    slot: "background" | "desktop" | "mobile",
    file: File | undefined,
  ) {
    if (!file) return;
    const asset = await uploadWebDesignAsset(file);
    if (slot === "background") {
      onChange({
        ...value,
        backgroundMediaId: asset.id,
        backgroundImageUrl: undefined,
      });
    } else if (slot === "desktop") {
      onChange({
        ...value,
        desktopMediaId: asset.id,
        desktopImageUrl: undefined,
      });
    } else {
      onChange({
        ...value,
        mobileMediaId: asset.id,
        mobileImageUrl: undefined,
      });
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        {(
          [
            {
              key: "background" as const,
              title: "Background image",
              mediaId: value.backgroundMediaId,
              imageUrl: value.backgroundImageUrl,
              frame: WEB_DESIGN_FEATURED_FRAMES.background,
            },
            {
              key: "desktop" as const,
              title: "Desktop website image",
              mediaId: value.desktopMediaId,
              imageUrl: value.desktopImageUrl,
              frame: WEB_DESIGN_FEATURED_FRAMES.desktop,
            },
            {
              key: "mobile" as const,
              title: "Mobile website image",
              mediaId: value.mobileMediaId,
              imageUrl: value.mobileImageUrl,
              frame: WEB_DESIGN_FEATURED_FRAMES.mobile,
            },
          ] as const
        ).map((slot) => (
          <label key={slot.key} className="block">
            <span className={label}>{slot.title}</span>
            <div className="relative mt-2 h-16 w-24 overflow-hidden rounded-md bg-surface-elevated">
              <MediaImage
                mediaId={slot.mediaId}
                imageUrl={slot.imageUrl}
                alt={slot.title}
                fit="cover"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              className="mt-2 block w-full text-xs"
              onChange={(e) => void upload(slot.key, e.target.files?.[0])}
            />
            <p className="mt-1 text-[11px] text-muted">
              Përmasa: {slot.frame.width} × {slot.frame.height} px ·{" "}
              {slot.frame.ratioLabel}
            </p>
          </label>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label>
          <span className={label}>Background position</span>
          <input
            className={field}
            value={value.backgroundPosition ?? "50% 50%"}
            onChange={(e) =>
              onChange({ ...value, backgroundPosition: e.target.value })
            }
            placeholder="50% 40%"
          />
        </label>
        <label>
          <span className={label}>Overlay color</span>
          <input
            type="color"
            className="mt-1 h-10 w-full rounded border border-border bg-background"
            value={value.backgroundOverlayColor ?? "#000000"}
            onChange={(e) =>
              onChange({ ...value, backgroundOverlayColor: e.target.value })
            }
          />
        </label>
        <label>
          <span className={label}>
            Overlay opacity ({Math.round((value.backgroundOverlay ?? 0.42) * 100)}%)
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            className="mt-3 w-full"
            value={value.backgroundOverlay ?? 0.42}
            onChange={(e) =>
              onChange({
                ...value,
                backgroundOverlay: Number(e.target.value),
              })
            }
          />
        </label>
        <label>
          <span className={label}>
            Blur ({value.backgroundBlur ?? 18}px)
          </span>
          <input
            type="range"
            min={0}
            max={60}
            step={1}
            className="mt-3 w-full"
            value={value.backgroundBlur ?? 18}
            onChange={(e) =>
              onChange({
                ...value,
                backgroundBlur: Number(e.target.value),
              })
            }
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label>
          <span className={label}>Desktop scale</span>
          <input
            type="number"
            min={0.4}
            max={2}
            step={0.05}
            className={field}
            value={value.desktopScale}
            onChange={(e) =>
              onChange({ ...value, desktopScale: Number(e.target.value) })
            }
          />
        </label>
        <label>
          <span className={label}>Desktop X %</span>
          <input
            type="number"
            className={field}
            value={value.desktopPositionX}
            onChange={(e) =>
              onChange({ ...value, desktopPositionX: Number(e.target.value) })
            }
          />
        </label>
        <label>
          <span className={label}>Desktop Y %</span>
          <input
            type="number"
            className={field}
            value={value.desktopPositionY}
            onChange={(e) =>
              onChange({ ...value, desktopPositionY: Number(e.target.value) })
            }
          />
        </label>
        <label>
          <span className={label}>Mobile scale</span>
          <input
            type="number"
            min={0.4}
            max={2}
            step={0.05}
            className={field}
            value={value.mobileScale}
            onChange={(e) =>
              onChange({ ...value, mobileScale: Number(e.target.value) })
            }
          />
        </label>
        <label>
          <span className={label}>Mobile X %</span>
          <input
            type="number"
            className={field}
            value={value.mobilePositionX}
            onChange={(e) =>
              onChange({ ...value, mobilePositionX: Number(e.target.value) })
            }
          />
        </label>
        <label>
          <span className={label}>Mobile Y %</span>
          <input
            type="number"
            className={field}
            value={value.mobilePositionY}
            onChange={(e) =>
              onChange({ ...value, mobilePositionY: Number(e.target.value) })
            }
          />
        </label>
      </div>
    </div>
  );
}
