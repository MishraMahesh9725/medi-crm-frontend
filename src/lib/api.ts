/**
 * Central fetch wrapper.
 *
 * - Reads NEXT_PUBLIC_API_URL for the base URL.
 * - Reads the JWT from the `medibill_token` cookie (set by the /api/auth route handler).
 * - Transforms backend error shapes into readable messages.
 * - Throws ApiError on non-2xx responses.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)medibill_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

type FetchOptions = RequestInit & {
  /** When true, don't wrap body as JSON (for FormData etc.) */
  rawBody?: boolean;
};

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { rawBody, headers: extraHeaders, body, ...rest } = options;

  const token = getToken();

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(rawBody ? {} : { "Content-Type": "application/json" }),
    ...(extraHeaders as Record<string, string>),
  };

  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers,
    body,
  });

  if (!res.ok) {
    let errorMsg = `Request failed (${res.status})`;
    let details: unknown;
    try {
      const err = await res.json();
      errorMsg =
        err?.message ??
        err?.error ??
        (Array.isArray(err?.errors) ? err.errors.map((e: {message: string}) => e.message).join("; ") : undefined) ??
        errorMsg;
      details = err;
    } catch {
      // response body wasn't JSON
    }

    if (res.status === 401) {
      // Clear token cookie and redirect to login
      if (typeof document !== "undefined") {
        document.cookie =
          "medibill_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/login";
      }
    }

    throw new ApiError(res.status, errorMsg, details);
  }

  // No-content response
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

/** Convenience helpers */
export const api = {
  get: <T>(path: string, init?: FetchOptions) =>
    apiFetch<T>(path, { method: "GET", ...init }),

  post: <T>(path: string, body: unknown, init?: FetchOptions) =>
    apiFetch<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
      ...init,
    }),

  patch: <T>(path: string, body: unknown, init?: FetchOptions) =>
    apiFetch<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...init,
    }),

  delete: <T>(path: string, init?: FetchOptions) =>
    apiFetch<T>(path, { method: "DELETE", ...init }),
};
