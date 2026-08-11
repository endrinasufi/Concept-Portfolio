"use client";

import Link from "next/link";
import { useProjects } from "@/lib/hooks/useProjects";
import { getProjectCover } from "@/lib/utils/projectCover";
import { MediaImage } from "@/components/branding/MediaImage";
import { Reveal } from "@/components/motion/Reveal";

export function BrandingListClient() {
  const { projects, loading, error } = useProjects({ service: "branding" });

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Portfolio</p>
        <h1 className="font-display mt-3 text-5xl md:text-6xl">Branding</h1>
        <p className="mt-4 max-w-xl text-muted">
          Identitete dhe sisteme vizuale — çdo projekt me paletë të përshtatur dhe kompozim editorial.
        </p>
      </Reveal>

      {loading ? (
        <p className="mt-16 text-muted">Duke ngarkuar projektet…</p>
      ) : error ? (
        <p className="mt-16 text-red-400">{error}</p>
      ) : (
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => {
            const { coverUrl, coverMediaId } = getProjectCover(project);
            return (
              <Reveal key={project.id} delay={i * 0.06}>
                <Link href={`/branding/${project.slug}`} className="group block">
                  <div className="overflow-hidden rounded-[var(--radius-xl)] bg-surface">
                    <div className="aspect-[4/5] overflow-hidden">
                      <MediaImage
                        mediaId={coverMediaId}
                        imageUrl={coverUrl}
                        alt={project.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="p-5">
                      <div className="mb-3 flex gap-1.5">
                        {project.brandColors.slice(0, 5).map((c) => (
                          <span
                            key={c.id}
                            className="h-2.5 w-2.5 rounded-full ring-1 ring-white/10"
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                      </div>
                      <h2 className="font-display text-2xl transition group-hover:text-accent">
                        {project.title}
                      </h2>
                      <p className="mt-1 text-sm text-muted">
                        {project.client} · {project.year}
                      </p>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
