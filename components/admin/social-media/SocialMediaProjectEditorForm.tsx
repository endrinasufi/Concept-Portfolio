"use client";

import { useState } from "react";
import Link from "next/link";
import type { SocialMediaProject } from "@/types/social-media";
import {
  emptySocialMediaProjectDraft,
  SOCIAL_MEDIA_COVER_FRAME,
} from "@/types/social-media";
import { slugify } from "@/lib/utils/id";
import { uploadSocialMediaAsset } from "@/lib/social-media/media";
import { MediaImage } from "@/components/branding/MediaImage";
import { SocialMediaFeedEditor } from "./SocialMediaFeedEditor";
import { SocialMediaStoriesEditor } from "./SocialMediaStoriesEditor";
import { SocialMediaReelsEditor } from "./SocialMediaReelsEditor";
import { SocialMediaUsernamesEditor } from "./SocialMediaUsernamesEditor";
import { ExternalLink, Trash2 } from "lucide-react";

export type SocialMediaProjectFormValue = Omit<
  SocialMediaProject,
  "id" | "createdAt" | "updatedAt" | "service"
>;

export function emptySocialMediaProjectForm(): SocialMediaProjectFormValue {
  const d = emptySocialMediaProjectDraft();
  return {
    slug: d.slug,
    title: d.title,
    clientName: d.clientName,
    serviceLabel: d.serviceLabel,
    usernames: d.usernames,
    status: d.status,
    order: d.order,
    coverMediaId: d.coverMediaId,
    coverImageUrl: d.coverImageUrl,
    pageAppearance: d.pageAppearance,
    block1: d.block1,
    block2: d.block2,
    block3: d.block3,
    seo: d.seo,
  };
}

const field =
  "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";
const label = "block text-xs uppercase tracking-[0.16em] text-muted";

export function SocialMediaProjectEditorForm({
  initial,
  saving,
  onSave,
}: {
  initial: SocialMediaProjectFormValue;
  saving?: boolean;
  onSave: (value: SocialMediaProjectFormValue) => Promise<void>;
}) {
  const [value, setValue] = useState<SocialMediaProjectFormValue>(initial);

  function patch(partial: Partial<SocialMediaProjectFormValue>) {
    setValue((v) => ({ ...v, ...partial }));
  }

  async function uploadMockup(slot: 1 | 2, file: File | undefined) {
    if (!file) return;
    const asset = await uploadSocialMediaAsset(file);
    if (slot === 1) {
      patch({
        block1: {
          ...value.block1,
          mockupImage1MediaId: asset.id,
          mockupImage1Url: undefined,
        },
      });
    } else {
      patch({
        block1: {
          ...value.block1,
          mockupImage2MediaId: asset.id,
          mockupImage2Url: undefined,
        },
      });
    }
  }

  const colors = [...(value.block2.backgroundColors ?? [])];
  while (colors.length < 3) colors.push("");

  return (
    <form
      className="space-y-10"
      onSubmit={(e) => {
        e.preventDefault();
        void onSave({
          ...value,
          slug: value.slug || slugify(value.title || value.clientName),
          block2: {
            ...value.block2,
            backgroundColors: value.block2.backgroundColors
              .filter(Boolean)
              .slice(0, 3),
            grainStrength: Math.min(
              1,
              Math.max(0, Number(value.block2.grainStrength) || 0),
            ),
          },
        });
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">
            {initial.title ? "Edito projektin" : "Projekt Social Media i ri"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            3 blloqe · CMS i izoluar nga Branding
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {value.slug ? (
            <Link
              href={`/social-media/${value.slug}?preview=true`}
              target="_blank"
              className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm"
            >
              <ExternalLink size={14} /> Preview
            </Link>
          ) : null}
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background disabled:opacity-60"
          >
            {saving ? "Duke ruajtur…" : "Ruaj"}
          </button>
        </div>
      </div>

      <section className="grid gap-4 rounded-[var(--radius-lg)] border border-border bg-surface/40 p-5 md:grid-cols-2">
        <h2 className="font-display text-xl md:col-span-2">General</h2>
        <label className={label}>
          Title
          <input
            className={field}
            value={value.title}
            onChange={(e) => patch({ title: e.target.value })}
            required
          />
        </label>
        <label className={label}>
          Slug
          <input
            className={field}
            value={value.slug}
            onChange={(e) => patch({ slug: e.target.value })}
          />
        </label>
        <label className={label}>
          Client name
          <input
            className={field}
            value={value.clientName}
            onChange={(e) => patch({ clientName: e.target.value })}
            required
          />
        </label>
        <label className={label}>
          Service / category
          <input
            className={field}
            value={value.serviceLabel}
            onChange={(e) => patch({ serviceLabel: e.target.value })}
          />
        </label>
        <label className={`${label} md:col-span-2`}>
          Usernames / handles
        </label>
        <div className="md:col-span-2">
          <SocialMediaUsernamesEditor
            usernames={value.usernames}
            onChange={(usernames) => patch({ usernames })}
          />
        </div>
        <label className={label}>
          Status
          <select
            className={field}
            value={value.status}
            onChange={(e) =>
              patch({ status: e.target.value as "draft" | "published" })
            }
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label className={label}>
          Page background
          <div className="mt-1 flex gap-2">
            <input
              type="color"
              value={value.pageAppearance.backgroundColor || "#EAEAEA"}
              onChange={(e) =>
                patch({
                  pageAppearance: {
                    ...value.pageAppearance,
                    backgroundColor: e.target.value,
                  },
                })
              }
              className="h-10 w-12 cursor-pointer rounded border border-border bg-background"
            />
            <input
              className={field + " !mt-0"}
              value={value.pageAppearance.backgroundColor}
              onChange={(e) =>
                patch({
                  pageAppearance: {
                    ...value.pageAppearance,
                    backgroundColor: e.target.value,
                  },
                })
              }
              placeholder="#EAEAEA"
            />
          </div>
        </label>
        <label className={label}>
          Line color
          <div className="mt-1 flex gap-2">
            <input
              type="color"
              value={value.pageAppearance.lineColor || "#1a1a1a"}
              onChange={(e) =>
                patch({
                  pageAppearance: {
                    ...value.pageAppearance,
                    lineColor: e.target.value,
                  },
                })
              }
              className="h-10 w-12 cursor-pointer rounded border border-border bg-background"
            />
            <input
              className={field + " !mt-0"}
              value={value.pageAppearance.lineColor}
              onChange={(e) =>
                patch({
                  pageAppearance: {
                    ...value.pageAppearance,
                    lineColor: e.target.value,
                  },
                })
              }
            />
          </div>
        </label>
      </section>

      <section className="space-y-4 rounded-[var(--radius-lg)] border border-border bg-surface/40 p-5">
        <h2 className="font-display text-xl">Cover (lista /social-media)</h2>
        <p className="text-xs text-muted">
          Fotoja që shfaqet te karta e projektit në faqen e listës.
        </p>
        <div className="flex flex-wrap items-start gap-4">
          <div className="relative h-28 w-24 overflow-hidden rounded-lg bg-surface-elevated">
            <MediaImage
              mediaId={value.coverMediaId}
              imageUrl={value.coverImageUrl}
              alt="Cover"
              fit="cover"
            />
          </div>
          <div className="space-y-2">
            <label className="inline-flex cursor-pointer items-center rounded-full border border-border px-3 py-1.5 text-xs hover:bg-surface-elevated">
              Upload cover
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  void uploadSocialMediaAsset(file).then((asset) => {
                    patch({
                      coverMediaId: asset.id,
                      coverImageUrl: undefined,
                    });
                  });
                }}
              />
            </label>
            {(value.coverMediaId || value.coverImageUrl) && (
              <button
                type="button"
                onClick={() =>
                  patch({ coverMediaId: undefined, coverImageUrl: undefined })
                }
                className="inline-flex items-center gap-1 rounded-full border border-red-500/30 px-3 py-1.5 text-xs text-red-400"
              >
                <Trash2 size={12} /> Hiq
              </button>
            )}
            <p className="text-[11px] text-muted">
              Përmasa: {SOCIAL_MEDIA_COVER_FRAME.width} ×{" "}
              {SOCIAL_MEDIA_COVER_FRAME.height} px ·{" "}
              {SOCIAL_MEDIA_COVER_FRAME.ratioLabel}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-[var(--radius-lg)] border border-border bg-surface/40 p-5">
        <h2 className="font-display text-xl">Block 1 — Hero</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {([1, 2] as const).map((slot) => {
            const mediaId =
              slot === 1
                ? value.block1.mockupImage1MediaId
                : value.block1.mockupImage2MediaId;
            const imageUrl =
              slot === 1
                ? value.block1.mockupImage1Url
                : value.block1.mockupImage2Url;
            return (
              <div key={slot} className="rounded-xl border border-border p-3">
                <p className="mb-2 text-xs uppercase tracking-[0.16em] text-muted">
                  Mockup {slot}
                </p>
                <div className="relative mx-auto aspect-[9/16] w-28 overflow-hidden rounded-xl bg-surface-elevated">
                  <MediaImage
                    mediaId={mediaId}
                    imageUrl={imageUrl}
                    alt={`Mockup ${slot}`}
                    fit="cover"
                  />
                </div>
                <label className="mt-3 block text-xs text-muted">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-1 block w-full text-xs"
                    onChange={(e) =>
                      void uploadMockup(slot, e.target.files?.[0])
                    }
                  />
                </label>
              </div>
            );
          })}
        </div>
        <SocialMediaFeedEditor
          posts={value.block1.feedPosts}
          onChange={(feedPosts) =>
            patch({ block1: { ...value.block1, feedPosts } })
          }
        />
      </section>

      <section className="space-y-4 rounded-[var(--radius-lg)] border border-border bg-surface/40 p-5">
        <h2 className="font-display text-xl">Block 2 — Floating card</h2>
        <label className={label}>
          Section title
          <input
            className={field}
            value={value.block2.title}
            onChange={(e) =>
              patch({ block2: { ...value.block2, title: e.target.value } })
            }
          />
        </label>
        <label className={label}>
          Audience
          <textarea
            className={field}
            rows={3}
            value={value.block2.audience}
            onChange={(e) =>
              patch({ block2: { ...value.block2, audience: e.target.value } })
            }
          />
        </label>
        <label className={label}>
          Project challenge
          <textarea
            className={field}
            rows={3}
            value={value.block2.projectChallenge}
            onChange={(e) =>
              patch({
                block2: { ...value.block2, projectChallenge: e.target.value },
              })
            }
          />
        </label>
        <label className={label}>
          Result
          <textarea
            className={field}
            rows={3}
            value={value.block2.result}
            onChange={(e) =>
              patch({ block2: { ...value.block2, result: e.target.value } })
            }
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <label key={i} className={label}>
              Background color {i + 1}
              <div className="mt-1 flex gap-2">
                <input
                  type="color"
                  value={colors[i] || "#1a1420"}
                  onChange={(e) => {
                    const next = [...colors];
                    next[i] = e.target.value;
                    patch({
                      block2: {
                        ...value.block2,
                        backgroundColors: next.filter(Boolean),
                      },
                    });
                  }}
                  className="h-10 w-12 rounded border border-border"
                />
                <input
                  className={field + " !mt-0"}
                  value={colors[i] || ""}
                  onChange={(e) => {
                    const next = [...colors];
                    next[i] = e.target.value;
                    patch({
                      block2: {
                        ...value.block2,
                        backgroundColors: next,
                      },
                    });
                  }}
                  placeholder="#1a1420"
                />
              </div>
            </label>
          ))}
        </div>

        <label className={label}>
          Grain strength ({Math.round(value.block2.grainStrength * 100)}%)
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={value.block2.grainStrength}
            onChange={(e) =>
              patch({
                block2: {
                  ...value.block2,
                  grainStrength: Number(e.target.value),
                },
              })
            }
            className="mt-3 w-full"
          />
        </label>

        <SocialMediaReelsEditor
          reels={value.block2.reels}
          onChange={(reels) => patch({ block2: { ...value.block2, reels } })}
        />
      </section>

      <section className="rounded-[var(--radius-lg)] border border-border bg-surface/40 p-5">
        <h2 className="mb-4 font-display text-xl">Block 3 — Stories</h2>
        <SocialMediaStoriesEditor
          stories={value.block3?.stories ?? []}
          onChange={(stories) =>
            patch({ block3: { ...(value.block3 ?? { stories: [] }), stories } })
          }
        />
      </section>

      <section className="grid gap-4 rounded-[var(--radius-lg)] border border-border bg-surface/40 p-5 md:grid-cols-2">
        <h2 className="font-display text-xl md:col-span-2">SEO</h2>
        <label className={label}>
          Meta title
          <input
            className={field}
            value={value.seo.metaTitle ?? ""}
            onChange={(e) =>
              patch({ seo: { ...value.seo, metaTitle: e.target.value } })
            }
          />
        </label>
        <label className={label}>
          Meta description
          <input
            className={field}
            value={value.seo.metaDescription ?? ""}
            onChange={(e) =>
              patch({ seo: { ...value.seo, metaDescription: e.target.value } })
            }
          />
        </label>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background disabled:opacity-60"
        >
          {saving ? "Duke ruajtur…" : "Ruaj projektin"}
        </button>
      </div>
    </form>
  );
}
