import type { VideoProductionItem } from "@/types/video-production";
import { normalizeVideoOrientation } from "@/types/video-production";
import { videoCardWidth } from "@/lib/video-production/youtube";

/** Indekse exclusive ku përfundon çdo rresht (p.sh. [3, 7, 10]). */
export function computeRowBreaks(
  videos: VideoProductionItem[],
  containerWidth: number,
  gap = 20,
): number[] {
  if (!videos.length) return [];
  const width = Math.max(containerWidth, 160);
  const breaks: number[] = [];
  let used = 0;
  let countInRow = 0;

  for (let i = 0; i < videos.length; i++) {
    const orientation = normalizeVideoOrientation(videos[i].orientation);
    const w = Math.min(videoCardWidth(orientation), width);
    const need = countInRow === 0 ? w : w + gap;

    if (countInRow > 0 && used + need > width + 0.5) {
      breaks.push(i);
      used = w;
      countInRow = 1;
    } else {
      used += need;
      countInRow += 1;
    }
  }

  breaks.push(videos.length);
  return breaks;
}
