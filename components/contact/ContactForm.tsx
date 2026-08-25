"use client";

import { useState } from "react";

const inputCard =
  "mt-1.5 w-full rounded-lg border border-white/[0.1] bg-[#111113] px-3.5 py-2.5 text-[13px] text-white outline-none transition placeholder:text-white/30 focus:border-[rgba(255,159,26,0.55)]";

export function ContactForm({
  variant = "plain",
}: {
  compact?: boolean;
  variant?: "plain" | "card";
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    variant === "card"
      ? inputCard
      : "mt-1 w-full border-0 border-b border-white/15 bg-transparent px-0 py-2 text-sm text-foreground outline-none transition placeholder:text-muted/40 focus:border-accent";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          website,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setDone(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="py-6">
        <p className="text-2xl font-semibold tracking-tight text-white">
          Thank you.
        </p>
        <p className="mt-2 text-sm text-white/45">
          Your message was sent. We&apos;ll get back to you soon.
        </p>
        <button
          type="button"
          className="mt-6 rounded-lg border border-white/25 px-4 py-2 text-sm text-white transition hover:border-[#ff9f1a]"
          onClick={() => setDone(false)}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
      <label className="block text-[12px] font-medium text-white">
        Name
        <input
          required
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          placeholder="Your name"
        />
      </label>

      <label className="block text-[12px] font-medium text-white">
        Email
        <input
          required
          type="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="name@email.com"
        />
      </label>

      <label className="block text-[12px] font-medium text-white">
        Subject
        <input
          required
          className={inputClass}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="What is this about?"
        />
      </label>

      <label className="block text-[12px] font-medium text-white">
        Message
        <textarea
          required
          rows={4}
          className={`${inputClass} resize-none`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your project…"
        />
      </label>

      <input
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        aria-hidden
      />

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <button
        type="submit"
        disabled={busy}
        className="rounded-lg border border-white/30 bg-transparent px-5 py-2.5 text-[13px] font-medium text-white transition hover:border-[#ff9f1a] hover:bg-[#ff9f1a]/10 disabled:opacity-50"
      >
        {busy ? "Sending…" : "Send Request"}
      </button>
    </form>
  );
}
