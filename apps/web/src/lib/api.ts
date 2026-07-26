"use client";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8781";

export async function api<T = unknown>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const headers = new Headers(init?.headers);
  let body = init?.body;
  if (init?.json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(init.json);
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    body,
    credentials: "include",
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = (await res.json()) as { error?: string | { formErrors?: string[] } };
      msg = typeof j.error === "string" ? j.error : JSON.stringify(j.error);
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return (await res.json()) as T;
}
