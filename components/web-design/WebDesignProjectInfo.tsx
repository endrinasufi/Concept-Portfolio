"use client";

import type { WebDesignProject } from "@/types/web-design";

function titleLines(title: string) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 2) return [words.join(" ")];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

export function WebDesignProjectInfo({
  project,
}: {
  project: WebDesignProject;
}) {
  const lines = titleLines(project.title);

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col justify-between">
      <div>
        <h1 className="font-page-title flex max-w-full flex-col gap-[0.12em] break-words text-[clamp(3.5rem,7.2vw,6.75rem)] leading-none text-white [text-wrap:balance]">
          {lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h1>
      </div>

      <div className="mt-8 lg:mt-0">
        <p className="text-[1.05rem] font-medium text-white">
          {project.descriptionTitle || "Description"}
        </p>
        {project.description ? (
          <p className="mt-3 max-w-[18rem] text-[13.5px] leading-[1.65] text-white/72">
            {project.description}
          </p>
        ) : null}
        {project.websiteUrl ? (
          <a
            href={project.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1 text-[12px] text-white/45 transition hover:text-white"
          >
            Visit Website ↗
          </a>
        ) : null}
      </div>
    </div>
  );
}
