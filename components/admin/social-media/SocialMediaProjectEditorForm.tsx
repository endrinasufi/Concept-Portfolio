"use client";

import { useState } from "react";
import Link from "next/link";
import type { SocialMediaProject } from "@/types/social-media";
import {
  defaultPageAppearance,
  SOCIAL_MEDIA_COVER_FRAME,
} from "@/types/social-media";
import { createId, slugify } from "@/lib/utils/id";
import { uploadSocialMediaAsset } from "@/lib/social-media/media";
import { SocialMediaFeedEditor } from "./SocialMediaFeedEditor";
import { SocialMediaStoriesEditor } from "./SocialMediaStoriesEditor";
import { SocialMediaReelsEditor } from "./SocialMediaReelsEditor";
import { SocialMediaUsernamesEditor } from "./SocialMediaUsernamesEditor";
import { WebDesignMediaSlot } from "@/components/admin/web-design/WebDesignMediaSlot";
import { ExternalLink } from "lucide-react";

export type SocialMediaProjectFormValue = Omit<
  SocialMediaProject,
  "id" | "createdAt" | "updatedAt" | "service"
>;

export function emptySocialMediaProjectForm(): SocialMediaProjectFormValue {
  return {
    slug: "emri-klientit",
    title: "Emri i projektit",
    clientName: "Emri i klientit",
    serviceLabel: "Social Media Management",
    usernames: [
      {
        id: createId(),
        label: "@klienti",
        url: "https://instagram.com/klienti",
        order: 0,
      },
      {
        id: createId(),
        label: "@klienti",
        url: "https://tiktok.com/@klienti",
        order: 1,
      },
    ],
    status: "draft",
    order: 0,
    coverMediaId: undefined,
    coverImageUrl: undefined,
    pageAppearance: defaultPageAppearance(),
    block1: { feedPosts: [] },
    block2: {
      title: "Project overview",
      audience:
        "Përshkruaj audiencën e markës — kush janë, çfarë kërkojnë dhe ku i gjen në social media.",
      projectChallenge:
        "Cili ishte problemi ose sfida e projektit që duhej zgjidhur me përmbajtje në rrjetet sociale.",
      result:
        "Çfarë u arrit: rritje engagement, identitet më i qartë, ose një sistem i rregullt postimesh.",
      backgroundColors: ["#141018", "#2a1820", "#0a0c12"],
      grainStrength: 0.55,
      reels: [],
    },
    block3: { stories: [] },
    seo: {
      metaTitle: "Emri i projektit — Social Media | Concept Marketing",
      metaDescription:
        "Menaxhim i rrjeteve sociale: feed, reels dhe stories për këtë markë.",
    },
  };
}

const field =
  "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";
const label = "block text-xs uppercase tracking-[0.16em] text-muted";

export function SocialMediaProjectEditorForm({
  initial,
  saving,
  onSave,
  isNew = false,
}: {
  initial: SocialMediaProjectFormValue;
  saving?: boolean;
  onSave: (value: SocialMediaProjectFormValue) => Promise<void>;
  isNew?: boolean;
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
          <h1 className="text-3xl">
            {isNew ? "Projekt Social Media i ri" : "Edito projektin"}
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

      <section className="grid gap-4 admin-card p-5 md:grid-cols-2">
        <h2 className="text-xl md:col-span-2">General</h2>
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

      <section className="admin-card p-4 sm:p-5">
        <div className="grid gap-5 lg:grid-cols-3 lg:gap-0">
          <div className="min-w-0 lg:border-r lg:border-[#1a1a1a]/10 lg:pr-5">
            <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
              Cover (lista /social-media)
            </h2>
            <p className="mt-1 text-[11px] leading-snug text-muted">
              Fotoja që shfaqet te karta e projektit në faqen e listës.
            </p>
            <div className="mt-3">
              <WebDesignMediaSlot
                title="Cover"
                mediaId={value.coverMediaId}
                imageUrl={value.coverImageUrl}
                width={SOCIAL_MEDIA_COVER_FRAME.width}
                height={SOCIAL_MEDIA_COVER_FRAME.height}
                aspectClass="aspect-[4/5]"
                boxClassName="w-[16.5rem] max-w-full"
                onFile={(file) => {
                  if (!file) return;
                  void uploadSocialMediaAsset(file).then((asset) => {
                    patch({
                      coverMediaId: asset.id,
                      coverImageUrl: undefined,
                    });
                  });
                }}
                onClear={() =>
                  patch({ coverMediaId: undefined, coverImageUrl: undefined })
                }
              />
            </div>
          </div>

          <div className="min-w-0 lg:col-span-2 lg:pl-5">
            <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
              Block 1 — Hero
            </h2>
            <p className="mt-1 text-[11px] leading-snug text-muted">
              Dy telefonat që shfaqen në krye të faqes së projektit.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
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
                  <WebDesignMediaSlot
                    key={slot}
                    title={`Mockup ${slot}`}
                    mediaId={mediaId}
                    imageUrl={imageUrl}
                    width={1080}
                    height={1920}
                    aspectClass="aspect-[4/5]"
                    boxClassName="w-[16.5rem] max-w-full"
                    onFile={(file) => void uploadMockup(slot, file)}
                    onClear={() =>
                      patch({
                        block1: {
                          ...value.block1,
                          ...(slot === 1
                            ? {
                                mockupImage1MediaId: undefined,
                                mockupImage1Url: undefined,
                              }
                            : {
                                mockupImage2MediaId: undefined,
                                mockupImage2Url: undefined,
                              }),
                        },
                      })
                    }
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-[#1a1a1a]/10 pt-5">
          <SocialMediaFeedEditor
            posts={value.block1.feedPosts}
            onChange={(feedPosts) =>
              patch({ block1: { ...value.block1, feedPosts } })
            }
          />
        </div>
      </section>

      <section className="space-y-4 admin-card p-5">
        <h2 className="text-xl">Block 2 — Floating card</h2>
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

      <section className="admin-card p-5">
        <h2 className="mb-4 text-xl">Block 3 — Stories</h2>
        <SocialMediaStoriesEditor
          stories={value.block3?.stories ?? []}
          onChange={(stories) =>
            patch({ block3: { ...(value.block3 ?? { stories: [] }), stories } })
          }
        />
      </section>

      <section className="grid gap-4 admin-card p-5 md:grid-cols-2">
        <h2 className="text-xl md:col-span-2">SEO</h2>
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
