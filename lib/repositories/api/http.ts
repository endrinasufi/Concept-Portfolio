function authHint(status: number): string | null {
  if (status === 401) {
    return "Session expired. Log out and log in again, then retry the upload.";
  }
  if (status === 403) {
    return "Upload blocked (403). Log out and log in again. If it continues, Hostinger may be blocking the file — try JPG/WebP under 5 MB.";
  }
  return null;
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error ||
        authHint(res.status) ||
        `Request failed (${res.status})`,
    );
  }
  return data;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: "include", cache: "no-store" });
  return parseJson<T>(res);
}

export async function apiSend<T>(
  path: string,
  method: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(path, {
    method,
    credentials: "include",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  return parseJson<T>(res);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("Could not read file for upload"));
    reader.readAsDataURL(file);
  });
}

export async function apiUpload<T>(
  path: string,
  form: FormData,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      credentials: "include",
      body: form,
      cache: "no-store",
    });
  } catch {
    throw new Error(
      "Could not reach the server (Failed to fetch). Check that MySQL/XAMPP is running and that npm run dev is working.",
    );
  }

  // Hostinger / ModSecurity sometimes blocks multipart with bare 403.
  if (res.status === 403 || res.status === 401) {
    const file = form.get("file");
    if (file instanceof File) {
      try {
        const fileBase64 = await fileToBase64(file);
        const payload: Record<string, string | number> = {
          fileBase64,
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
        };
        const id = form.get("id");
        const width = form.get("width");
        const height = form.get("height");
        if (typeof id === "string" && id) payload.id = id;
        if (typeof width === "string" && width) payload.width = Number(width);
        if (typeof height === "string" && height) payload.height = Number(height);

        const retry = await fetch(path, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          cache: "no-store",
        });
        return parseJson<T>(retry);
      } catch {
        /* fall through to original error */
      }
    }
  }

  return parseJson<T>(res);
}
