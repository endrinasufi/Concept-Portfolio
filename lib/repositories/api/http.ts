async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error || `Request failed (${res.status})`,
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
      "Nuk u lidh me serverin (Failed to fetch). Kontrollo që MySQL/XAMPP është ndezur dhe që npm run dev po punon.",
    );
  }
  return parseJson<T>(res);
}
