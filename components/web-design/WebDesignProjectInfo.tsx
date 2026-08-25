"use client";

import type { WebDesignProject } from "@/types/web-design";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function WebDesignProjectInfo({
  project,
  index,
  total,
}: {
  project: WebDesignProject;
  index: number;
  total: number;
}) {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col justify-between">
      <div>
        <p className="text-[13px] font-normal text-white/55">
          {pad(index)}
          <span className="mx-1.5 text-white/30">|</span>
          {pad(total)}
          <span className="ml-2.5 text-white/55">{project.serviceLabel}</span>
        </p>

        <h1 className="font-page-title mt-3 text-[clamp(2.25rem,4vw,3.85rem)] text-white">
          {project.title}
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
