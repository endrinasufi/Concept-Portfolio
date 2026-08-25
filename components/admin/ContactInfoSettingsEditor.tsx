"use client";

import { useEffect, useState } from "react";
import { useSiteSettings } from "@/lib/hooks/useSiteSettings";
import { createId, sortByOrder } from "@/lib/utils/id";
import {
  defaultChannelLabel,
  type ContactChannel,
  type ContactChannelKind,
  type ContactLocation,
} from "@/types/settings";
import { Plus, Trash2 } from "lucide-react";

const KINDS: ContactChannelKind[] = [
  "email",
  "phone",
  "whatsapp",
  "instagram",
  "facebook",
  "linkedin",
  "website",
  "other",
];

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm";

export function ContactInfoSettingsEditor() {
  const { settings, loading, update } = useSiteSettings();
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [mapQuery, setMapQuery] = useState("");
  const [channels, setChannels] = useState<ContactChannel[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    const loc = settings.contactLocation;
    setAddress(loc?.address ?? "");
    setCity(loc?.city ?? "");
    setCountry(loc?.country ?? "");
    setMapQuery(loc?.mapQuery ?? "");
    setChannels(sortByOrder(settings.contactChannels ?? []));
  }, [loading, settings.contactLocation, settings.contactChannels]);

  function addChannel() {
    setChannels((prev) => [
      ...prev,
      {
        id: createId(),
        kind: "email",
        label: "Email",
        value: "",
        order: prev.length,
      },
    ]);
  }

  function updateChannel(id: string, patch: Partial<ContactChannel>) {
    setChannels((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const next = { ...c, ...patch };
        if (patch.kind && !patch.label) {
          next.label = defaultChannelLabel(patch.kind);
        }
        return next;
      }),
    );
  }

  function removeChannel(id: string) {
    setChannels((prev) =>
      prev.filter((c) => c.id !== id).map((c, i) => ({ ...c, order: i })),
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const contactLocation: ContactLocation | undefined = address.trim()
        ? {
            address: address.trim(),
            city: city.trim() || undefined,
            country: country.trim() || undefined,
            mapQuery: mapQuery.trim() || undefined,
          }
        : undefined;
      await update({
        contactLocation: contactLocation ?? null,
        contactChannels: channels
          .map((c, i) => ({ ...c, order: i, value: c.value.trim() }))
          .filter((c) => c.value.length > 0),
      });
      setMessage("Contact info saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void save(e)}
      className="space-y-4 rounded-2xl bg-white/70 p-4"
    >
      <div>
        <h2 className="text-sm font-medium">Contact & map</h2>
        <p className="mt-0.5 text-[11px] text-muted">
          Address appears with a map on /kontakt. Add email, phone, and other
          channels.
        </p>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="block text-xs sm:col-span-2">
          <span className="text-muted">Address</span>
          <input
            className={inputClass}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="St. …, Tirana"
          />
        </label>
        <label className="block text-xs">
          <span className="text-muted">City</span>
          <input
            className={inputClass}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Tirana"
          />
        </label>
        <label className="block text-xs">
          <span className="text-muted">Country</span>
          <input
            className={inputClass}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Albania"
          />
        </label>
        <label className="block text-xs sm:col-span-2">
          <span className="text-muted">
            Map query (optional — if empty, address is used)
          </span>
          <input
            className={inputClass}
            value={mapQuery}
            onChange={(e) => setMapQuery(e.target.value)}
            placeholder="Concept Marketing Albania, Tirana"
          />
        </label>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted">
            Contact channels
          </h3>
          <button
            type="button"
            onClick={addChannel}
            className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px]"
          >
            <Plus size={12} />
            Add
          </button>
        </div>

        {channels.length === 0 ? (
          <p className="text-[11px] text-muted">
            No channels yet — add email, phone, etc.
          </p>
        ) : (
          <ul className="space-y-2">
            {channels.map((c) => (
              <li
                key={c.id}
                className="grid gap-2 rounded-xl border border-border/60 bg-background/40 p-2.5 sm:grid-cols-[7.5rem_7rem_1fr_auto]"
              >
                <label className="block text-[10px] text-muted">
                  Type
                  <select
                    className={inputClass}
                    value={c.kind}
                    onChange={(e) =>
                      updateChannel(c.id, {
                        kind: e.target.value as ContactChannelKind,
                      })
                    }
                  >
                    {KINDS.map((k) => (
                      <option key={k} value={k}>
                        {defaultChannelLabel(k)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-[10px] text-muted">
                  Label
                  <input
                    className={inputClass}
                    value={c.label}
                    onChange={(e) =>
                      updateChannel(c.id, { label: e.target.value })
                    }
                  />
                </label>
                <label className="block text-[10px] text-muted">
                  Value
                  <input
                    className={inputClass}
                    value={c.value}
                    onChange={(e) =>
                      updateChannel(c.id, { value: e.target.value })
                    }
                    placeholder={
                      c.kind === "email"
                        ? "info@…"
                        : c.kind === "phone" || c.kind === "whatsapp"
                          ? "+355 …"
                          : "https://…"
                    }
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeChannel(c.id)}
                  className="self-end rounded-lg border border-border p-2 text-muted hover:text-red-600"
                  aria-label="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error ? <p className="text-xs text-red-500">{error}</p> : null}
      {message ? <p className="text-xs text-green-600">{message}</p> : null}

      <button
        type="submit"
        disabled={busy || loading}
        className="rounded-full bg-foreground px-3 py-1.5 text-xs text-background disabled:opacity-60"
      >
        {busy ? "Saving…" : "Save contacts"}
      </button>
    </form>
  );
}
