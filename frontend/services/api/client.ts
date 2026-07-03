const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

function normalizeBase() {
  if (!baseUrl) {
    return "http://localhost:5000/api";
  }

  const normalized = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  if (normalized.endsWith("/api")) {
    return normalized;
  }
  return `${normalized}/api`;
}

export function buildApiUrl(path: string) {
  const normalized = normalizeBase();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = normalized.endsWith("/api") && normalizedPath.startsWith("/api")
    ? `${normalized}${normalizedPath.slice(4)}`
    : `${normalized}${normalizedPath}`;

  console.log("endpoint:", url);
  return url;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public payload?: unknown
  ) {
    super(message);
  }
}

function extractErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const data = payload as {
      detail?: unknown;
      message?: unknown;
      error?: unknown;
    };
    const candidate = data.detail ?? data.message ?? data.error;

    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }

    try {
      return JSON.stringify(payload);
    } catch {
      return fallback;
    }
  }

  return fallback;
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = buildApiUrl(path);

  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {})
      },
      cache: "no-store"
    });

    let responsePayload: unknown;
    try {
      responsePayload = await response.json();
    } catch {
      responsePayload = await response.text();
    }

    if (!response.ok) {
      console.log("response:", responsePayload);
      throw new ApiError(
        extractErrorMessage(responsePayload, `Request failed with status ${response.status}`),
        response.status,
        responsePayload
      );
    }

    console.log("response:", responsePayload);
    return responsePayload as T;
  } catch (error) {
    console.log("error:", error);
    throw error;
  }
}

export function apiGet<T>(path: string) {
  return apiRequest<T>(path);
}

export function apiPost<T, P>(path: string, payload: P) {
  return apiRequest<T>(path, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function apiPut<T, P>(path: string, payload: P) {
  return apiRequest<T>(path, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}
