/** Extract a still frame from a video File (browser only). */
export async function extractVideoFrame(
  file: File,
  atSeconds = 0.35,
): Promise<File> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = objectUrl;

    await new Promise<void>((resolve, reject) => {
      const onReady = () => resolve();
      const onError = () => reject(new Error("Video nuk u ngarkua"));
      video.addEventListener("loadeddata", onReady, { once: true });
      video.addEventListener("error", onError, { once: true });
    });

    const duration = Number.isFinite(video.duration) ? video.duration : 1;
    const seekTo = Math.min(Math.max(atSeconds, 0.05), Math.max(duration * 0.15, 0.05));

    await new Promise<void>((resolve, reject) => {
      const onSeeked = () => resolve();
      const onError = () => reject(new Error("Seek dështoi"));
      video.addEventListener("seeked", onSeeked, { once: true });
      video.addEventListener("error", onError, { once: true });
      try {
        video.currentTime = seekTo;
      } catch {
        reject(new Error("Seek dështoi"));
      }
    });

    const width = video.videoWidth || 720;
    const height = video.videoHeight || 1280;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas nuk u krijua");
    ctx.drawImage(video, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Frame nuk u krijua"))),
        "image/jpeg",
        0.88,
      );
    });

    const base = file.name.replace(/\.[^.]+$/, "") || "reel";
    return new File([blob], `${base}-thumb.jpg`, { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
