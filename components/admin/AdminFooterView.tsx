"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useSiteSettings } from "@/lib/hooks/useSiteSettings";
import { resolveFooterSettings } from "@/lib/layout/footer";
import { createId } from "@/lib/utils/id";
import type { FooterNavLink, SiteSettings } from "@/types/settings";
import {
  DEFAULT_FOOTER_BRAND_NAME,
  DEFAULT_FOOTER_CONTACT_LABEL,
  DEFAULT_FOOTER_CTA_TITLE,
  DEFAULT_FOOTER_CTA_URL,
  DEFAULT_FOOTER_EMAIL,
  DEFAULT_FOOTER_EXPLORE_LABEL,
  DEFAULT_FOOTER_LOCATION,
  DEFAULT_FOOTER_LOCATION_LABEL,
  DEFAULT_FOOTER_SOCIAL_LABEL,
} from "@/types/settings";

type FooterForm = {
  footerCtaTitle: string;
  footerCtaUrl: string;
  footerEmail: string;
  footerLocation: string;
  footerBrandName: string;
  footerContactLabel: string;
  footerLocationLabel: string;
  footerSocialLabel: string;
  footerExploreLabel: string;
  footerSocialLinks: FooterNavLink[];
  footerExploreLinks: FooterNavLink[];
};

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm";

function fromSettings(settings: SiteSettings): FooterForm {
  const resolved = resolveFooterSettings(settings);
  return {
    footerCtaTitle: resolved.ctaTitle,
    footerCtaUrl: resolved.ctaUrl,
    footerEmail: resolved.email,
    footerLocation: resolved.location,
    footerBrandName: resolved.brandName,
    footerContactLabel: resolved.contactLabel,
    footerLocationLabel: resolved.locationLabel,
    footerSocialLabel: resolved.socialLabel,
    footerExploreLabel: resolved.exploreLabel,
    footerSocialLinks: resolved.socialLinks.map((item) => ({ ...item })),
    footerExploreLinks: resolved.exploreLinks.map((item) => ({ ...item })),
  };
}

function reindex(links: FooterNavLink[]): FooterNavLink[] {
  return links.map((item, order) => ({ ...item, order }));
}

function LinkRows({
  items,
  onChange,
  hrefPlaceholder,
}: {
  items: FooterNavLink[];
  onChange: (next: FooterNavLink[]) => void;
  hrefPlaceholder: string;
}) {
  function patch(id: string, key: "label" | "href", value: string) {
    onChange(
      items.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="grid gap-2 rounded-xl border border-border bg-white/50 p-2.5 sm:grid-cols-[1fr_1.4fr_auto]"
        >
          <input
            type="text"
            value={item.label}
            onChange={(e) => patch(item.id, "label", e.target.value)}
            placeholder="Emri"
            className={inputClass + " mt-0"}
          />
          <input
            type="text"
            value={item.href}
            onChange={(e) => patch(item.id, "href", e.target.value)}
            placeholder={hrefPlaceholder}
            className={inputClass + " mt-0"}
          />
          <button
            type="button"
            onClick={() => onChange(reindex(items.filter((row) => row.id !== item.id)))}
            className="inline-flex items-center justify-center rounded-lg px-2 text-muted hover:text-red-600"
            aria-label="Hiq"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function AdminFooterView() {
  const { settings, loading, update } = useSiteSettings();
  const [form, setForm] = useState<FooterForm>(() => fromSettings(settings));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) setForm(fromSettings(settings));
  }, [loading, settings]);

  function setField<K extends keyof FooterForm>(key: K, value: FooterForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addSocial() {
    setForm((prev) => ({
      ...prev,
      footerSocialLinks: reindex([
        ...prev.footerSocialLinks,
        { id: createId(), label: "", href: "", order: prev.footerSocialLinks.length },
      ]),
    }));
  }

  function addExplore() {
    setForm((prev) => ({
      ...prev,
      footerExploreLinks: reindex([
        ...prev.footerExploreLinks,
        { id: createId(), label: "", href: "/", order: prev.footerExploreLinks.length },
      ]),
    }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const social = reindex(
        form.footerSocialLinks.filter((item) => item.label.trim() || item.href.trim()),
      );
      const explore = reindex(
        form.footerExploreLinks.filter((item) => item.label.trim() || item.href.trim()),
      );
      await update({
        footerCtaTitle: form.footerCtaTitle.trim() || DEFAULT_FOOTER_CTA_TITLE,
        footerCtaUrl: form.footerCtaUrl.trim() || DEFAULT_FOOTER_CTA_URL,
        footerEmail: form.footerEmail.trim() || DEFAULT_FOOTER_EMAIL,
        footerLocation: form.footerLocation.trim() || DEFAULT_FOOTER_LOCATION,
        footerBrandName: form.footerBrandName.trim() || DEFAULT_FOOTER_BRAND_NAME,
        footerContactLabel:
          form.footerContactLabel.trim() || DEFAULT_FOOTER_CONTACT_LABEL,
        footerLocationLabel:
          form.footerLocationLabel.trim() || DEFAULT_FOOTER_LOCATION_LABEL,
        footerSocialLabel:
          form.footerSocialLabel.trim() || DEFAULT_FOOTER_SOCIAL_LABEL,
        footerExploreLabel:
          form.footerExploreLabel.trim() || DEFAULT_FOOTER_EXPLORE_LABEL,
        footerSocialLinks: social,
        footerExploreLinks: explore,
      });
      setMessage("Footer u ruajt.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ruajtja dështoi");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => void save(e)} className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1>Footer</h1>
          <p>Ndrysho të gjitha tekstet dhe linket e footer-it publik.</p>
        </div>
        <button
          type="submit"
          disabled={busy || loading}
          className="rounded-full bg-foreground px-4 py-2 text-sm text-background disabled:opacity-60"
        >
          {busy ? "Duke ruajtur…" : "Ruaj footer-in"}
        </button>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      {message ? <p className="text-sm text-green-600">{message}</p> : null}

      <section className="admin-card space-y-3 p-4 md:p-5">
        <div>
          <h2 className="text-sm font-medium">CTA</h2>
          <p className="mt-1 text-xs text-muted">
            Titulli i madh në fund të faqes. Përdor rresht të ri për linjat.
          </p>
        </div>
        <label className="block text-xs">
          <span className="text-muted">Titulli</span>
          <textarea
            rows={3}
            value={form.footerCtaTitle}
            onChange={(e) => setField("footerCtaTitle", e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-xs">
          <span className="text-muted">Linku i CTA</span>
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
        <div>
          <h2 className="text-sm font-medium">Contact & Location</h2>
          <p className="mt-1 text-xs text-muted">
            Titujt e kolonave dhe të dhënat e kontaktit.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs">
            <span className="text-muted">Titulli Contact</span>
            <input
              type="text"
              value={form.footerContactLabel}
              onChange={(e) => setField("footerContactLabel", e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-xs">
            <span className="text-muted">Email</span>
            <input
              type="email"
              value={form.footerEmail}
              onChange={(e) => setField("footerEmail", e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-xs">
            <span className="text-muted">Titulli Location</span>
            <input
              type="text"
              value={form.footerLocationLabel}
              onChange={(e) => setField("footerLocationLabel", e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-xs">
            <span className="text-muted">Lokacioni</span>
            <input
              type="text"
              value={form.footerLocation}
              onChange={(e) => setField("footerLocation", e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      </section>

      <section className="admin-card space-y-3 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium">Social</h2>
            <p className="mt-1 text-xs text-muted">
              Shto, hiq ose ndrysho rrjetet. Nëse URL mungon, emri shfaqet pa link.
            </p>
          </div>
          <button
            type="button"
            onClick={addSocial}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px]"
          >
            <Plus size={12} /> Shto
          </button>
        </div>
        <label className="block text-xs">
          <span className="text-muted">Titulli i kolonës</span>
          <input
            type="text"
            value={form.footerSocialLabel}
            onChange={(e) => setField("footerSocialLabel", e.target.value)}
            className={inputClass}
          />
        </label>
        <LinkRows
          items={form.footerSocialLinks}
          onChange={(footerSocialLinks) => setField("footerSocialLinks", footerSocialLinks)}
          hrefPlaceholder="https://..."
        />
      </section>

      <section className="admin-card space-y-3 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium">Explore</h2>
            <p className="mt-1 text-xs text-muted">
              Linket e navigimit në footer. Përdor rrugë të brendshme si /branding.
            </p>
          </div>
          <button
            type="button"
            onClick={addExplore}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px]"
          >
            <Plus size={12} /> Shto
          </button>
        </div>
        <label className="block text-xs">
          <span className="text-muted">Titulli i kolonës</span>
          <input
            type="text"
            value={form.footerExploreLabel}
            onChange={(e) => setField("footerExploreLabel", e.target.value)}
            className={inputClass}
          />
        </label>
        <LinkRows
          items={form.footerExploreLinks}
          onChange={(footerExploreLinks) =>
            setField("footerExploreLinks", footerExploreLinks)
          }
          hrefPlaceholder="/branding"
        />
      </section>

      <section className="admin-card space-y-3 p-4 md:p-5">
        <div>
          <h2 className="text-sm font-medium">Shiriti i poshtëm</h2>
          <p className="mt-1 text-xs text-muted">
            Emri majtas. Viti © gjenerohet automatikisht.
          </p>
        </div>
        <label className="block text-xs">
          <span className="text-muted">Emri i studios</span>
          <input
            type="text"
            value={form.footerBrandName}
            onChange={(e) => setField("footerBrandName", e.target.value)}
            className={inputClass}
          />
        </label>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={busy || loading}
          className="rounded-full bg-foreground px-4 py-2 text-sm text-background disabled:opacity-60"
        >
          {busy ? "Duke ruajtur…" : "Ruaj footer-in"}
        </button>
      </div>
    </form>
  );
}
