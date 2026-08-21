import type { ApiError } from "./types";

// The centralized auth service issues and verifies credentials.
const AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL ?? "http://localhost:5000/api/v1";

// The ERP backend owns every other resource (inventory, orders, customers,
// users, roles, tenants, ...) and trusts the token the auth service issued.
const ERP_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4100/api/v1";

export const TOKEN_COOKIE = "ias_token";
const REFRESH_TOKEN_KEY = "ias_refresh_token";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_COOKIE);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_COOKIE, token);
  // Mirrored into a cookie (readable by middleware) so protected routes
  // can be gated at the edge, not just in the browser.
  document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=${60 * 60 * 8}; SameSite=Lax`;
}

export function setRefreshToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_COOKIE);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`;
}

// Both services respond with { success, message, data }. This unwraps that
// envelope automatically so callers just get the payload; a raw JSON body
// (no envelope) is passed through as-is for flexibility.
interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

function isEnvelope(json: unknown): json is ApiEnvelope<unknown> {
  return (
    typeof json === "object" &&
    json !== null &&
    "success" in json &&
    "data" in json
  );
}

async function request<T>(
  baseUrl: string,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  let json: unknown = undefined;
  try {
    json = res.status === 204 ? undefined : await res.json();
  } catch {
    // response had no JSON body
  }

  if (!res.ok) {
    const message =
      json && isEnvelope(json) && json.message ? json.message : res.statusText;
    const error: ApiError = { message, status: res.status };
    throw error;
  }

  if (json && isEnvelope(json)) {
    if (!json.success) {
      const error: ApiError = {
        message: json.message ?? "Request failed",
        status: res.status,
      };
      throw error;
    }
    return json.data as T;
  }

  return json as T;
}

function createApiClient(baseUrl: string) {
  return {
    get: <T>(path: string) => request<T>(baseUrl, path, { method: "GET" }),
    post: <T>(path: string, body?: unknown) =>
      request<T>(baseUrl, path, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
      }),
    put: <T>(path: string, body?: unknown) =>
      request<T>(baseUrl, path, {
        method: "PUT",
        body: body ? JSON.stringify(body) : undefined,
      }),
    patch: <T>(path: string, body?: unknown) =>
      request<T>(baseUrl, path, {
        method: "PATCH",
        body: body ? JSON.stringify(body) : undefined,
      }),
    delete: <T>(path: string) =>
      request<T>(baseUrl, path, { method: "DELETE" }),
  };
}

// Auth/identity calls (login, session check) go to the centralized service.
export const authApi = createApiClient(AUTH_BASE_URL);

// Everything else goes to the ERP backend.
export const erpApi = createApiClient(ERP_BASE_URL);

// Back-compat alias — existing resource pages import `api` from here and
// were already talking to the ERP backend.
export const api = erpApi;
