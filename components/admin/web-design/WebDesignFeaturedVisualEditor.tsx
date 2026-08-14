"use client";

import type { WebDesignFeaturedVisual } from "@/types/web-design";
import { WEB_DESIGN_FEATURED_FRAMES } from "@/types/web-design";
import { uploadWebDesignAsset } from "@/lib/web-design/media";
import { WebDesignMediaSlot } from "./WebDesignMediaSlot";

const field =
  "mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm";
const label = "block text-[10px] font-medium uppercase tracking-[0.16em] text-muted";

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

  const slots = [
    {
      key: "background" as const,
      title: "Background image",
      mediaId: value.backgroundMediaId,
      imageUrl: value.backgroundImageUrl,
      frame: WEB_DESIGN_FEATURED_FRAMES.background,
      clear: () =>
        onChange({
          ...value,
          backgroundMediaId: undefined,
          backgroundImageUrl: undefined,
        }),
    },
    {
      key: "desktop" as const,
      title: "Desktop website image",
      mediaId: value.desktopMediaId,
      imageUrl: value.desktopImageUrl,
      frame: WEB_DESIGN_FEATURED_FRAMES.desktop,
      clear: () =>
        onChange({
          ...value,
          desktopMediaId: undefined,
          desktopImageUrl: undefined,
        }),
    },
    {
      key: "mobile" as const,
      title: "Mobile website image",
      mediaId: value.mobileMediaId,
      imageUrl: value.mobileImageUrl,
      frame: WEB_DESIGN_FEATURED_FRAMES.mobile,
      clear: () =>
        onChange({
          ...value,
          mobileMediaId: undefined,
          mobileImageUrl: undefined,
        }),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {slots.map((slot) => (
          <WebDesignMediaSlot
            key={slot.key}
            title={slot.title}
            mediaId={slot.mediaId}
            imageUrl={slot.imageUrl}
            width={slot.frame.width}
            height={slot.frame.height}
            boxClassName="w-[20.25rem] max-w-full"
            onFile={(file) => void upload(slot.key, file)}
            onClear={slot.clear}
          />
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
            className="mt-1 h-8 w-full rounded-lg border border-border bg-background"
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
          <span className={label}>Blur ({value.backgroundBlur ?? 18}px)</span>
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

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
