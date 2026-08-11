"use client";

import Link from "next/link";
import { useProjects } from "@/lib/hooks/useProjects";
import { getProjectCover } from "@/lib/utils/projectCover";
import { FadeIn, Reveal } from "@/components/motion/Reveal";
import { MediaImage } from "@/components/branding/MediaImage";

export default function HomePage() {
  const { projects, loading } = useProjects({ service: "branding" });
  const featured = projects.filter((p) => p.featured).slice(0, 3);

  return (
    <div className="editorial-grain relative">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(80% 60% at 70% 0%, rgba(212,165,116,0.18), transparent 55%), radial-gradient(60% 50% at 10% 80%, rgba(80,100,120,0.12), transparent 50%), #0a0a0b",
          }}
        />
        <div className="mx-auto flex min-h-[calc(100vh-var(--header-offset))] max-w-7xl flex-col justify-end px-5 pb-16 pt-[var(--header-offset)] md:px-8 md:pb-24">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.35em] text-accent">Concept Marketing Albania</p>
            <h1 className="font-display mt-4 max-w-4xl text-5xl leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
              Branding që ndërton prani.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted md:text-xl">
              Identitete vizuale, sisteme marke dhe drejtim artistik — portfolio editorial për markat që duan të dallohet.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/branding"
                className="rounded-full bg-foreground px-7 py-3 text-sm font-medium text-background transition hover:bg-accent hover:text-background"
              >
                Shiko branding
              </Link>
              <Link
                href="/admin"
                className="rounded-full border border-border px-7 py-3 text-sm text-muted transition hover:border-foreground/40 hover:text-foreground"
              >
                Hap admin
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-border py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal>
            <div className="mb-12 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted">Featured</p>
                <h2 className="font-display mt-2 text-3xl md:text-4xl">Projekte branding</h2>
              </div>
              <Link href="/branding" className="text-sm text-accent hover:underline">
                Të gjitha →
              </Link>
            </div>
          </Reveal>

          {loading ? (
            <p className="text-muted">Duke ngarkuar…</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {featured.map((project, i) => {
                const { coverUrl, coverMediaId } = getProjectCover(project);
                return (
                  <Reveal key={project.id} delay={i * 0.08} className={i === 0 ? "md:col-span-2" : ""}>
                    <Link
                      href={`/branding/${project.slug}`}
                      className="group relative block overflow-hidden rounded-[var(--radius-xl)]"
                    >
                      <div className={`relative ${i === 0 ? "aspect-[21/9]" : "aspect-[4/3]"}`}>
                        <MediaImage
                          mediaId={coverMediaId}
                          imageUrl={coverUrl}
                          alt={project.title}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        <div className="absolute bottom-0 p-6 md:p-8">
                          <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                            {project.client}
                          </p>
                          <h3 className="font-display mt-1 text-2xl text-white md:text-4xl">
                            {project.title}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
