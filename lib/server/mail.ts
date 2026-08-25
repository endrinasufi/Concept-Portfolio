import "server-only";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";
import type { SiteSettings } from "@/types/settings";
import { DEFAULT_SITE_SETTINGS } from "@/types/settings";
import { getServerMediaRepository } from "@/lib/repositories/server";

const FONT =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function siteBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://portfolio.conceptmarketing.al"
  );
}

/** Logo e bardhë (light) për header të errët. */
async function resolveWhiteLogoUrl(
  settings: SiteSettings,
): Promise<string> {
  const mediaId = settings.logoMediaId?.trim();
  if (mediaId) {
    try {
      const url = await getServerMediaRepository().getUrl(mediaId);
      if (url?.startsWith("http")) return url;
    } catch {
      /* fallback */
    }
  }
  return `${siteBaseUrl()}/brand/logo-light.svg`;
}
export type ContactMailPayload = {
  to: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

export function resolveSmtpConfig(settings: SiteSettings): SmtpConfig | null {
  const host =
    settings.smtpHost?.trim() || DEFAULT_SITE_SETTINGS.smtpHost || "";
  const user =
    settings.smtpUser?.trim() || DEFAULT_SITE_SETTINGS.smtpUser || "";
  const pass = settings.smtpPass?.trim() || "";
  if (!host || !user || !pass) return null;

  const port =
    typeof settings.smtpPort === "number" && settings.smtpPort > 0
      ? settings.smtpPort
      : (DEFAULT_SITE_SETTINGS.smtpPort ?? 465);
  const secure =
    settings.smtpSecure ??
    DEFAULT_SITE_SETTINGS.smtpSecure ??
    port === 465;
  const from =
    settings.smtpFrom?.trim() ||
    DEFAULT_SITE_SETTINGS.smtpFrom ||
    user;

  return { host, port, secure, user, pass, from };
}

export function isSmtpConfigured(settings: SiteSettings): boolean {
  return resolveSmtpConfig(settings) !== null;
}

/** From duhet të përputhet me SMTP user (ndihmon SPF/DKIM dhe anti-spam). */
function alignedFromHeader(smtp: SmtpConfig): string {
  const authEmail = smtp.user.trim();
  const display =
    smtp.from.match(/^"?([^"<]+)"?\s*</)?.[1]?.trim() ||
    smtp.from.replace(/<[^>]+>/, "").trim() ||
    "Concept Marketing";
  const fromAddr =
    smtp.from.match(/<([^>]+)>/)?.[1]?.trim() ||
    (smtp.from.includes("@") ? smtp.from.trim() : "");
  if (fromAddr && fromAddr.toLowerCase() === authEmail.toLowerCase()) {
    return smtp.from.includes("<")
      ? smtp.from
      : `"${display}" <${authEmail}>`;
  }
  return `"${display.replace(/"/g, "")}" <${authEmail}>`;
}

function domainFromEmail(email: string): string {
  const at = email.lastIndexOf("@");
  return at >= 0 ? email.slice(at + 1).toLowerCase() : "localhost";
}

function formatAddressLine(settings: SiteSettings): string | null {
  const loc = settings.contactLocation;
  if (!loc?.address?.trim()) return null;
  return [loc.address, loc.city, loc.country]
    .map((p) => p?.trim())
    .filter(Boolean)
    .join(", ");
}

function buildContactEmail(
  settings: SiteSettings,
  payload: ContactMailPayload,
  logoUrl: string,
): { subject: string; text: string; html: string } {
  const name = payload.name.trim();
  const email = payload.email.trim();
  const phone = payload.phone?.trim() || "";
  const subject = payload.subject.trim();
  const message = payload.message.trim();
  const addressLine = formatAddressLine(settings);
  const siteUrl = siteBaseUrl();
  const when = new Date().toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Tirane",
  });

  const mailSubject = `Website enquiry from Portfolio Website — ${name}`.slice(
    0,
    120,
  );

  const text = [
    `Concept Marketing — New Request from Portfolio Website`,
    ``,
    `Received: ${when}`,
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    `Subject: ${subject}`,
    ``,
    `Message:`,
    message,
    ``,
    `—`,
    `Reply directly to this email to answer ${name}.`,
    addressLine ? `Concept Marketing · ${addressLine}` : `Concept Marketing Albania`,
    siteUrl,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const phoneRow = phone
    ? `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee;width:28%;font:600 12px/1.4 ${FONT};color:#888;text-transform:uppercase;letter-spacing:0.06em;">Phone</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;font:400 15px/1.5 ${FONT};color:#1a1a1a;">${escapeHtml(phone)}</td>
      </tr>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${escapeHtml(mailSubject)}</title>
  <!--[if !mso]><!-->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <!--<![endif]-->
  <style>
    body, table, td, a, p, h1, h2, div { font-family: ${FONT} !important; }
  </style>
</head>
<body style="margin:0;padding:0;background:#f3f1ec;font-family:${FONT};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">
    New enquiry from ${escapeHtml(name)}: ${escapeHtml(subject)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f1ec;padding:28px 12px;font-family:${FONT};">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e4dc;font-family:${FONT};">
          <tr>
            <td style="background:#1a1a1a;padding:24px 28px 20px;font-family:${FONT};">
              <img
                src="${escapeAttr(logoUrl)}"
                alt="Concept Marketing"
                width="168"
                style="display:block;width:168px;max-width:60%;height:auto;border:0;outline:none;text-decoration:none;"
              />
              <h1 style="margin:18px 0 0;font:600 22px/1.3 ${FONT};color:#ffffff;">New Request from Portfolio Website</h1>
              <p style="margin:8px 0 0;font:400 13px/1.4 ${FONT};color:rgba(255,255,255,0.62);">${escapeHtml(when)}</p>
            </td>
          </tr>
          <tr>
            <td style="height:4px;background:#fdd85d;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:26px 28px 8px;font-family:${FONT};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:${FONT};">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #eee;width:28%;font:600 12px/1.4 ${FONT};color:#888;text-transform:uppercase;letter-spacing:0.06em;">Name</td>
                  <td style="padding:10px 0;border-bottom:1px solid #eee;font:600 15px/1.5 ${FONT};color:#1a1a1a;">${escapeHtml(name)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #eee;font:600 12px/1.4 ${FONT};color:#888;text-transform:uppercase;letter-spacing:0.06em;">Email</td>
                  <td style="padding:10px 0;border-bottom:1px solid #eee;font:400 15px/1.5 ${FONT};">
                    <a href="mailto:${escapeAttr(email)}" style="color:#1a1a1a;text-decoration:underline;font-family:${FONT};">${escapeHtml(email)}</a>
                  </td>
                </tr>
                ${phoneRow}
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #eee;font:600 12px/1.4 ${FONT};color:#888;text-transform:uppercase;letter-spacing:0.06em;">Subject</td>
                  <td style="padding:10px 0;border-bottom:1px solid #eee;font:400 15px/1.5 ${FONT};color:#1a1a1a;">${escapeHtml(subject)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;font-family:${FONT};">
              <p style="margin:16px 0 10px;font:600 12px/1.4 ${FONT};color:#888;text-transform:uppercase;letter-spacing:0.06em;">Message</p>
              <div style="background:#faf8f4;border:1px solid #ebe6dc;border-radius:12px;padding:16px 18px;font:400 15px/1.65 ${FONT};color:#1a1a1a;white-space:pre-wrap;">${escapeHtml(message)}</div>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:22px;">
                <tr>
                  <td style="border-radius:999px;background:#1a1a1a;">
                    <a href="mailto:${escapeAttr(email)}?subject=${encodeURIComponent(`Re: ${subject}`)}" style="display:inline-block;padding:12px 22px;font:600 13px/1 ${FONT};color:#ffffff;text-decoration:none;">
                      Reply to ${escapeHtml(name.split(" ")[0] || name)}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 22px;background:#faf8f4;border-top:1px solid #ebe6dc;font-family:${FONT};">
              <p style="margin:0;font:400 12px/1.5 ${FONT};color:#888;">
                Sent automatically from the contact form ·
                <a href="${escapeAttr(siteUrl)}" style="color:#666;text-decoration:underline;font-family:${FONT};">portfolio.conceptmarketing.al</a>
              </p>
              ${
                addressLine
                  ? `<p style="margin:6px 0 0;font:400 12px/1.5 ${FONT};color:#aaa;">${escapeHtml(addressLine)}</p>`
                  : ""
              }
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;max-width:560px;font:400 11px/1.45 ${FONT};color:#aaa;text-align:center;">
          This is a transactional notification for Concept Marketing staff. Not a marketing message.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject: mailSubject, text, html };
}

/** Dërgon njoftimin e formës me SMTP nga Admin → Settings. */
export async function sendContactNotification(
  settings: SiteSettings,
  payload: ContactMailPayload,
): Promise<void> {
  const smtp = resolveSmtpConfig(settings);
  if (!smtp) {
    throw new Error(
      "SMTP is not configured in Admin → Settings (host, user, password).",
    );
  }

  const logoUrl = await resolveWhiteLogoUrl(settings);
  const { subject, text, html } = buildContactEmail(
    settings,
    payload,
    logoUrl,
  );
  const from = alignedFromHeader(smtp);
  const domain = domainFromEmail(smtp.user);
  const messageId = `<contact.${Date.now()}.${randomBytes(8).toString("hex")}@${domain}>`;

  const transport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.pass },
  });

  await transport.sendMail({
    from,
    to: payload.to,
    replyTo: `"${payload.name.replace(/"/g, "")}" <${payload.email}>`,
    subject,
    text,
    html,
    messageId,
    headers: {
      "X-Entity-Ref-ID": messageId,
      "X-Auto-Response-Suppress": "OOF, AutoReply",
      "X-Mailer": "Concept Marketing Portfolio",
    },
    // Ndihmon deliverability: envelope sender = llogaria e autentikuar
    envelope: {
      from: smtp.user,
      to: payload.to,
    },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/'/g, "&#39;");
}
