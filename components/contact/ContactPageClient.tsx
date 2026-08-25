"use client";

import { useEffect, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ContactForm } from "@/components/contact/ContactForm";
import { sortByOrder } from "@/lib/utils/id";
import {
  contactChannelHref,
  contactMapEmbedUrl,
  type PublicSiteSettings,
} from "@/types/settings";

const ORANGE = "#ff9f1a";
const ease = [0.22, 1, 0.36, 1] as const;

const SOCIAL_KINDS = new Set([
  "facebook",
  "instagram",
  "linkedin",
  "website",
  "whatsapp",
]);

export function ContactPageClient({
  settings,
}: {
  settings: PublicSiteSettings;
}) {
  const reduce = useReducedMotion();
  const channels = sortByOrder(settings.contactChannels ?? []);
  const location = settings.contactLocation;
  const addressLine = location
    ? [location.address, location.city, location.country]
        .filter(Boolean)
        .join(", ")
    : null;

  const infoChannels = channels.filter((c) => !SOCIAL_KINDS.has(c.kind));
  const socialChannels = channels.filter((c) => SOCIAL_KINDS.has(c.kind));

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--project-bg", "#030303");
    return () => {
      root.style.removeProperty("--project-bg");
    };
  }, []);

  let stagger = 0;
  const nextDelay = () => {
    const d = 0.16 + stagger * 0.07;
    stagger += 1;
    return d;
  };

  return (
    <div
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-5 pb-10 pt-[var(--header-offset)] md:px-10 lg:px-14"
      style={{ backgroundColor: "#030303" }}
    >
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-[85%]"
        style={{
          background: `
            radial-gradient(120% 90% at 50% -25%, ${ORANGE}99 0%, ${ORANGE}55 28%, transparent 62%),
            radial-gradient(70% 55% at 50% 0%, ${ORANGE}40 0%, transparent 70%)
          `,
        }}
        aria-hidden
        initial={reduce ? false : { opacity: 0.55, scale: 1.04 }}
        animate={
          reduce
            ? { opacity: 1 }
            : {
                opacity: [0.7, 1, 0.78],
                scale: [1.02, 1.08, 1.03],
              }
        }
        transition={
          reduce
            ? { duration: 0.6 }
            : {
                opacity: {
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                scale: {
                  duration: 9,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }
        }
      />

      <div className="relative z-[1] mx-auto grid w-full max-w-[1100px] items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16 xl:gap-20">
        <motion.div
          className="flex max-w-lg flex-col lg:max-w-none"
          initial={reduce ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease }}
        >
          <h1 className="font-hero-caps text-[clamp(3.2rem,8vw,5.2rem)] uppercase leading-[0.88] tracking-[-0.02em] text-white">
            Let&apos;s make your
            <br />
            brand brilliant!
          </h1>

          <p className="mt-5 max-w-[28rem] text-[15px] leading-[1.65] text-white/50">
            If you would like to work with us or just want to get in touch,
            we&apos;d love to hear from you!
          </p>

          <div className="mt-10 space-y-8">
            <div className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
              {addressLine ? (
                <InfoBlock
                  label="Address"
                  delay={nextDelay()}
                  reduce={Boolean(reduce)}
                >
                  <span className="text-[14px] leading-snug text-white/55">
                    {addressLine}
                  </span>
                </InfoBlock>
              ) : null}

              {infoChannels.map((c) => (
                <InfoBlock
                  key={c.id}
                  label={c.label}
                  delay={nextDelay()}
                  reduce={Boolean(reduce)}
                >
                  <a
                    href={contactChannelHref(c)}
                    className="text-[14px] text-white/55 transition hover:text-white"
                    target={
                      c.kind === "email" || c.kind === "phone"
                        ? undefined
                        : "_blank"
                    }
                    rel={
                      c.kind === "email" || c.kind === "phone"
                        ? undefined
                        : "noopener noreferrer"
                    }
                  >
                    {c.value}
                  </a>
                </InfoBlock>
              ))}
            </div>

            {socialChannels.length > 0 ? (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: nextDelay() }}
                className="flex flex-wrap gap-x-5 gap-y-2"
              >
                {socialChannels.map((c) => (
                  <a
                    key={c.id}
                    href={contactChannelHref(c)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] font-medium text-white/70 transition hover:font-semibold hover:text-white hover:underline hover:underline-offset-4"
                  >
                    {c.label}
                  </a>
                ))}
              </motion.div>
            ) : null}
          </div>
        </motion.div>

        <motion.div
          className="rounded-[1.25rem] border border-white/[0.09] bg-[#0a0a0c]/95 p-6 md:rounded-2xl md:p-8"
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.12 }}
        >
          <h2 className="text-[1.35rem] font-semibold leading-snug tracking-[-0.02em] text-white md:text-[1.5rem]">
            Send a message
          </h2>
          <div className="mt-6">
            <ContactForm variant="card" />
          </div>
        </motion.div>
      </div>

      {location ? (
        <motion.div
          className="relative z-[1] mx-auto mt-8 w-full max-w-[1100px]"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.28 }}
        >
          <div className="relative h-[7.5rem] overflow-hidden rounded-2xl border border-white/[0.08] bg-black md:h-32">
            <iframe
              title="Location map"
              src={contactMapEmbedUrl(location)}
              className="contact-map-dark absolute inset-0 h-full w-full scale-[1.06] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}

function InfoBlock({
  label,
  children,
  delay,
  reduce,
}: {
  label: string;
  children: ReactNode;
  delay: number;
  reduce: boolean;
}) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease, delay }}
    >
      <p className="font-hero-caps text-[2.4rem] uppercase leading-[0.9] tracking-[-0.02em] text-white md:text-[2.85rem]">
        {label}
      </p>
      <div className="mt-1.5">{children}</div>
    </motion.div>
  );
}
