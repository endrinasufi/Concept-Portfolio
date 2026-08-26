"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useSiteSettings } from "@/lib/hooks/useSiteSettings";
import {
  contactSocialChannels,
  DEFAULT_FOOTER_EXPLORE_IDS,
  FOOTER_EXPLORE_OPTIONS,
  formatFooterLocation,
  resolveFooterSettings,
} from "@/lib/layout/footer";
import { createId } from "@/lib/utils/id";
import {
  DEFAULT_FOOTER_BRAND_NAME,
  DEFAULT_FOOTER_CONTACT_LABEL,
  DEFAULT_FOOTER_CTA_TITLE,
  DEFAULT_FOOTER_CTA_URL,
  DEFAULT_FOOTER_EXPLORE_LABEL,
  DEFAULT_FOOTER_LOCATION,
  DEFAULT_FOOTER_LOCATION_LABEL,
  DEFAULT_FOOTER_SOCIAL_LABEL,
  contactChannelHref,
} from "@/types/settings";

type Slot = { key: string; id: string };

type FooterForm = {
  footerCtaTitle: string;
  footerCtaUrl: string;
  footerBrandName: string;
  footerContactLabel: string;
  footerLocationLabel: string;
  footerSocialLabel: string;
  footerExploreLabel: string;
  socialSlots: Slot[];
  exploreSlots: Slot[];
};

type SelectOption = { id: string; label: string; hint?: string };

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm";

function slotsFromIds(ids: string[]): Slot[] {
  return ids.map((id) => ({ key: createId(), id }));
}

function selectedIds(slots: Slot[]) {
  return slots.map((slot) => slot.id).filter(Boolean);
}

function DropdownSlots({
  slots,
  options,
  emptyLabel,
  addLabel,
  onChange,
}: {
  slots: Slot[];
  options: SelectOption[];
  emptyLabel: string;
  addLabel: string;
  onChange: (next: Slot[]) => void;
}) {
  function setSlot(key: string, id: string) {
    onChange(slots.map((slot) => (slot.key === key ? { ...slot, id } : slot)));
  }

  const used = new Set(selectedIds(slots));
  const canAdd = options.some((option) => !used.has(option.id));

  return (
    <div className="space-y-2">
      {slots.map((slot) => {
        const current = options.find((option) => option.id === slot.id);
        const available = options.filter(
          (option) => option.id === slot.id || !used.has(option.id),
        );
        return (
          <div
            key={slot.key}
            className="flex items-center gap-2 rounded-xl border border-border bg-white/50 p-2"
          >
            <select
              value={slot.id}
              onChange={(e) => setSlot(slot.key, e.target.value)}
              className={`${inputClass} mt-0 min-w-0 flex-1`}
            >
              <option value="">{emptyLabel}</option>
              {available.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            {current?.hint ? (
              <span className="hidden max-w-[40%] truncate text-[11px] text-muted sm:block">
                {current.hint}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() =>
                onChange(slots.filter((row) => row.key !== slot.key))
              }
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted hover:text-red-600"
              aria-label="Remove"
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      })}
      <button
        type="button"
        disabled={!canAdd}
        onClick={() => onChange([...slots, { key: createId(), id: "" }])}
        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px] disabled:opacity-40"
      >
        <Plus size={12} /> {addLabel}
      </button>
    </div>
  );
}

export function AdminFooterView({
  embedded = false,
  onEditContact,
}: {
  embedded?: boolean;
  onEditContact?: () => void;
}) {
  const { settings, loading, update } = useSiteSettings();
  const resolved = resolveFooterSettings(settings);
  const socials = useMemo(() => contactSocialChannels(settings), [settings]);

  const [form, setForm] = useState<FooterForm>(() => ({
    footerCtaTitle: resolved.ctaTitle,
    footerCtaUrl: resolved.ctaUrl,
    footerBrandName: resolved.brandName,
    footerContactLabel: resolved.contactLabel,
    footerLocationLabel: resolved.locationLabel,
    footerSocialLabel: resolved.socialLabel,
    footerExploreLabel: resolved.exploreLabel,
    socialSlots: slotsFromIds(socials.map((item) => item.id)),
    exploreSlots: slotsFromIds([...DEFAULT_FOOTER_EXPLORE_IDS]),
  }));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    const next = resolveFooterSettings(settings);
    const available = contactSocialChannels(settings);
    setForm({
      footerCtaTitle: next.ctaTitle,
      footerCtaUrl: next.ctaUrl,
      footerBrandName: next.brandName,
      footerContactLabel: next.contactLabel,
      footerLocationLabel: next.locationLabel,
      footerSocialLabel: next.socialLabel,
      footerExploreLabel: next.exploreLabel,
      socialSlots: slotsFromIds(
        settings.footerSocialChannelIds ?? available.map((item) => item.id),
      ),
      exploreSlots: slotsFromIds(
        Array.isArray(settings.footerExploreIds)
          ? settings.footerExploreIds
          : [...DEFAULT_FOOTER_EXPLORE_IDS],
      ),
    });
  }, [loading, settings]);

  function setField<K extends keyof FooterForm>(key: K, value: FooterForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      await update({
        footerCtaTitle: form.footerCtaTitle.trim() || DEFAULT_FOOTER_CTA_TITLE,
        footerCtaUrl: form.footerCtaUrl.trim() || DEFAULT_FOOTER_CTA_URL,
        footerBrandName: form.footerBrandName.trim() || DEFAULT_FOOTER_BRAND_NAME,
        footerContactLabel:
          form.footerContactLabel.trim() || DEFAULT_FOOTER_CONTACT_LABEL,
        footerLocationLabel:
          form.footerLocationLabel.trim() || DEFAULT_FOOTER_LOCATION_LABEL,
        footerSocialLabel:
          form.footerSocialLabel.trim() || DEFAULT_FOOTER_SOCIAL_LABEL,
        footerExploreLabel:
          form.footerExploreLabel.trim() || DEFAULT_FOOTER_EXPLORE_LABEL,
        footerSocialChannelIds: selectedIds(form.socialSlots),
        footerExploreIds: selectedIds(form.exploreSlots),
      });
      setMessage("Footer saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  const locationPreview = formatFooterLocation(
    settings.contactLocation,
    DEFAULT_FOOTER_LOCATION,
  );

  const socialOptions: SelectOption[] = socials.map((channel) => ({
    id: channel.id,
    label: channel.label,
    hint: contactChannelHref(channel),
  }));

  const exploreOptions: SelectOption[] = FOOTER_EXPLORE_OPTIONS.map((item) => ({
    id: item.id,
    label: item.label,
    hint: item.href,
  }));

  return (
    <form onSubmit={(e) => void save(e)} className="space-y-5">
      {!embedded ? (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1>Footer</h1>
            <p>Choose what the public footer shows. Links come from Contact.</p>
          </div>
          <button
            type="submit"
            disabled={busy || loading}
            className="rounded-full bg-foreground px-4 py-2 text-sm text-background disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save footer"}
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium">Footer</h2>
            <p className="mt-1 text-xs text-muted">
              Email, location and social links come from Contact & map. Here you
              only choose what to show.
            </p>
          </div>
          <button
            type="submit"
            disabled={busy || loading}
            className="rounded-full bg-foreground px-3 py-1.5 text-xs text-background disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save footer"}
          </button>
        </div>
      )}

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      {message ? <p className="text-sm text-green-600">{message}</p> : null}

      <section className="admin-card space-y-3 p-4 md:p-5">
        <h2 className="text-sm font-medium">CTA</h2>
        <label className="block text-xs">
          <span className="text-muted">Title</span>
          <textarea
            rows={3}
            value={form.footerCtaTitle}
            onChange={(e) => setField("footerCtaTitle", e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-xs">
          <span className="text-muted">CTA link</span>
          <input
            type="text"
            value={form.footerCtaUrl}
            onChange={(e) => setField("footerCtaUrl", e.target.value)}
            placeholder="/contact"
            className={inputClass}
          />
        </label>
      </section>

      <section className="admin-card space-y-3 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium">Contact & Location</h2>
            <p className="mt-1 text-xs text-muted">
              Taken automatically from Contact & map.
            </p>
          </div>
          {onEditContact ? (
            <button
              type="button"
              onClick={onEditContact}
              className="rounded-full border border-border px-3 py-1 text-[11px]"
            >
              Edit contact
            </button>
          ) : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs">
            <span className="text-muted">Contact label</span>
            <input
              type="text"
              value={form.footerContactLabel}
              onChange={(e) => setField("footerContactLabel", e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-xs">
            <span className="text-muted">Email (from Contact)</span>
            <input
              type="text"
              readOnly
              value={resolved.email}
              className={`${inputClass} cursor-default opacity-70`}
            />
          </label>
          <label className="block text-xs">
            <span className="text-muted">Location label</span>
            <input
              type="text"
              value={form.footerLocationLabel}
              onChange={(e) => setField("footerLocationLabel", e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-xs">
            <span className="text-muted">Location (from Contact)</span>
            <input
              type="text"
              readOnly
              value={locationPreview}
              className={`${inputClass} cursor-default opacity-70`}
            />
          </label>
        </div>
      </section>

      <section className="admin-card space-y-3 p-4 md:p-5">
        <div>
          <h2 className="text-sm font-medium">Social</h2>
          <p className="mt-1 text-xs text-muted">
            Add a row, then pick a channel from the dropdown. Links come from
            Contact.
          </p>
        </div>
        <label className="block text-xs">
          <span className="text-muted">Column title</span>
          <input
            type="text"
            value={form.footerSocialLabel}
            onChange={(e) => setField("footerSocialLabel", e.target.value)}
            className={inputClass}
          />
        </label>
        {socials.length === 0 ? (
          <p className="text-xs text-muted">
            No social channels yet. Add Instagram, LinkedIn, etc. in Contact &
            map.
          </p>
        ) : (
          <DropdownSlots
            slots={form.socialSlots}
            options={socialOptions}
            emptyLabel="Choose a channel…"
            addLabel="Add social"
            onChange={(socialSlots) => setField("socialSlots", socialSlots)}
          />
        )}
      </section>

      <section className="admin-card space-y-3 p-4 md:p-5">
        <div>
          <h2 className="text-sm font-medium">Explore</h2>
          <p className="mt-1 text-xs text-muted">
            Add a row, then pick a page from the dropdown.
          </p>
        </div>
        <label className="block text-xs">
          <span className="text-muted">Column title</span>
          <input
            type="text"
            value={form.footerExploreLabel}
            onChange={(e) => setField("footerExploreLabel", e.target.value)}
            className={inputClass}
          />
        </label>
        <DropdownSlots
          slots={form.exploreSlots}
          options={exploreOptions}
          emptyLabel="Choose a page…"
          addLabel="Add page"
          onChange={(exploreSlots) => setField("exploreSlots", exploreSlots)}
        />
      </section>

      <section className="admin-card space-y-3 p-4 md:p-5">
        <h2 className="text-sm font-medium">Bottom bar</h2>
        <label className="block text-xs">
          <span className="text-muted">Studio name</span>
          <input
            type="text"
            value={form.footerBrandName}
            onChange={(e) => setField("footerBrandName", e.target.value)}
            className={inputClass}
          />
        </label>
      </section>
    </form>
  );
}
