import { NextResponse } from "next/server";
import { createContactEntry } from "@/lib/server/contact";
import { isSmtpConfigured, sendContactNotification } from "@/lib/server/mail";
import { checkRateLimit } from "@/lib/server/rateLimit";
import { getServerSettingsRepository } from "@/lib/repositories/server/MySqlSettingsRepository";
import { DEFAULT_SITE_SETTINGS } from "@/types/settings";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const limit = checkRateLimit(`contact:${ip}`, {
    windowMs: 15 * 60 * 1000,
    max: 6,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Too many messages. Try again in ${limit.retryAfterSec}s.` },
      { status: 429 },
    );
  }

  let body: {
    name?: string;
    email?: string;
    phone?: string;
    subject?: string;
    message?: string;
    website?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot — bots fill this hidden field
  if (body.website?.trim()) {
    return NextResponse.json({ ok: true });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const subject = body.subject?.trim() ?? "";
  const message = body.message?.trim() ?? "";
  const phone = body.phone?.trim();

  if (name.length < 2) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }
  if (subject.length < 2) {
    return NextResponse.json({ error: "Subject is required." }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json(
      { error: "Message must be at least 10 characters." },
      { status: 400 },
    );
  }

  const fullMessage = `Subject: ${subject}\n\n${message}`;

  try {
    const entry = await createContactEntry({
      name,
      email,
      phone,
      message: fullMessage,
    });

    const settings = await getServerSettingsRepository().get();
    const notifyTo =
      settings.contactNotifyEmail?.trim() ||
      DEFAULT_SITE_SETTINGS.contactNotifyEmail ||
      "info@conceptmarketing.al";

    if (isSmtpConfigured(settings)) {
      try {
        await sendContactNotification(settings, {
          to: notifyTo,
          name,
          email,
          phone,
          subject,
          message,
        });
      } catch (mailErr) {
        console.error("[contact] email failed:", mailErr);
      }
    } else {
      console.warn(
        "[contact] SMTP not configured in Admin → Settings — message saved, email not sent.",
      );
    }

    return NextResponse.json({ ok: true, id: entry.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send" },
      { status: 500 },
    );
  }
}
