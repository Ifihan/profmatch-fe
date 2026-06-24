import type {
  JobStatusResponse,
  TokenResponse,
  User,
  SearchHistorySummary,
  SearchHistoryDetail,
  CreditsResponse,
  PlansResponse,
  PromoCode,
  PromoCodeRedemptionResponse,
  AdminStats,
  AdminUser,
  CreatePromoCodePayload,
} from "@/types";
import {
  mockAdminAuthResponse,
  mockRegularAuthResponse,
  mockAdminUser,
  mockRegularUser,
  mockAdminStats,
  mockPromoCodes,
  mockRedeemResponse,
  delay,
} from "@/lib/mock/adminMocks";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/lib/tokens";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Single-flight refresh: concurrent 401s share one /refresh call.
let refreshInFlight: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) {
      clearTokens();
      return null;
    }
    const data: TokenResponse = await res.json();
    setTokens(data.access_token, data.refresh_token);
    return data.access_token;
  } catch {
    return null;
  }
}

// Renews the access token via the refresh token; null if it can't be refreshed.
export function refreshSession(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
  retry = false
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const access = getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  // The stored token is the source of truth, so retries use the refreshed one.
  if (access) headers.Authorization = `Bearer ${access}`;

  const response = await fetch(url, {
    // Send/receive the session cookie that ties anonymous jobs to the caller.
    credentials: "include",
    ...options,
    headers,
  });

  // Access token likely expired — refresh once and retry transparently.
  if (response.status === 401 && !retry && getRefreshToken()) {
    const newToken = await refreshSession();
    if (newToken) return fetchApi<T>(endpoint, options, true);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(response.status, errorText || response.statusText);
  }

  return response.json();
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

// ── Auth endpoints ────────────────────────────────────────────────

export async function signup(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): Promise<TokenResponse> {
  return fetchApi<TokenResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      confirm_password: confirmPassword,
    }),
  });
}

export async function login(
  email: string,
  password: string
): Promise<TokenResponse> {
  if (USE_MOCK) {
    await delay(300);
    if (email === "admin@test.com") {
      return mockAdminAuthResponse;
    }
    return mockRegularAuthResponse;
  }
  return fetchApi<TokenResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function refreshToken(token: string): Promise<TokenResponse> {
  return fetchApi<TokenResponse>("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: token }),
  });
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return fetchApi<{ message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ message: string }> {
  return fetchApi<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, new_password: newPassword }),
  });
}

export async function getMe(token: string): Promise<User> {
  if (USE_MOCK) {
    await delay(200);
    return token === "mock-admin-token" ? mockAdminUser : mockRegularUser;
  }
  return fetchApi<User>("/api/auth/me", {
    headers: authHeaders(token),
  });
}

export async function listSearches(token: string): Promise<SearchHistorySummary[]> {
  return fetchApi<SearchHistorySummary[]>("/api/auth/me/searches", {
    headers: authHeaders(token),
  });
}

export async function getSearchDetail(
  token: string,
  searchId: string
): Promise<SearchHistoryDetail> {
  return fetchApi<SearchHistoryDetail>(`/api/auth/me/searches/${searchId}`, {
    headers: authHeaders(token),
  });
}

// ── Credits endpoints ─────────────────────────────────────────────

export async function getCredits(token: string): Promise<CreditsResponse> {
  return fetchApi<CreditsResponse>("/api/credits", {
    headers: authHeaders(token),
  });
}

export async function getCreditPlans(): Promise<PlansResponse> {
  return fetchApi<PlansResponse>("/api/credits/plans");
}

// Health check
export async function healthCheck(): Promise<{ status: string }> {
  return fetchApi<{ status: string }>("/health");
}

// ── Match endpoints ───────────────────────────────────────────────

// Submits a match job (CV uploaded inline); auth is optional.
export async function createMatch(
  universityUrl: string,
  researchInterests: string,
  cv: File,
  token?: string,
  onProgress?: (progress: number) => void
): Promise<JobStatusResponse> {
  const formData = new FormData();
  formData.append("university_url", universityUrl);
  formData.append("research_interests", researchInterests);
  formData.append("cv", cv);

  const xhr = new XMLHttpRequest();
  // Send/receive the session cookie that ties anonymous jobs to the caller.
  xhr.withCredentials = true;

  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new ApiError(xhr.status, xhr.responseText || xhr.statusText));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new ApiError(0, "Network error"));
    });

    xhr.open("POST", `${API_BASE_URL}/api/matches`);
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }
    xhr.send(formData);
  });
}

export async function getMatch(
  jobId: string,
  token?: string
): Promise<JobStatusResponse> {
  return fetchApi<JobStatusResponse>(`/api/matches/${jobId}`, {
    headers: token ? authHeaders(token) : undefined,
  });
}

// Opens an SSE stream of JobStatusResponse events (token via query param; cookie for anon).
export function createMatchEventSource(
  jobId: string,
  token?: string
): EventSource {
  const url = `${API_BASE_URL}/api/matches/${jobId}/events`;
  if (token) {
    return new EventSource(`${url}?token=${encodeURIComponent(token)}`);
  }
  return new EventSource(url, { withCredentials: true });
}

// ── Promo code endpoints ──────────────────────────────────────────

export async function redeemPromoCode(
  token: string,
  code: string
): Promise<PromoCodeRedemptionResponse> {
  if (USE_MOCK) {
    await delay(500);
    return mockRedeemResponse;
  }
  return fetchApi<PromoCodeRedemptionResponse>("/api/promo/redeem", {
    method: "POST",
    body: JSON.stringify({ code }),
    headers: authHeaders(token),
  });
}

// ── Admin endpoints ───────────────────────────────────────────────

export async function getAdminStats(token: string): Promise<AdminStats> {
  if (USE_MOCK) {
    await delay(400);
    return mockAdminStats;
  }
  return fetchApi<AdminStats>("/api/admin/metrics", {
    headers: authHeaders(token),
  });
}

export async function getAdminPromoCodes(token: string): Promise<PromoCode[]> {
  if (USE_MOCK) {
    await delay(400);
    return mockPromoCodes;
  }
  const data = await fetchApi<{ promos: PromoCode[] } | PromoCode[]>(
    "/api/admin/promo",
    { headers: authHeaders(token) }
  );
  return Array.isArray(data) ? data : data.promos;
}

// Responds with only { id, code }; the caller reconstructs the full row from the payload.
export async function createPromoCode(
  token: string,
  payload: CreatePromoCodePayload
): Promise<{ id: string; code: string }> {
  if (USE_MOCK) {
    await delay(500);
    return { id: `pc-${Date.now()}`, code: payload.code };
  }
  return fetchApi<{ id: string; code: string }>("/api/admin/promo", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: authHeaders(token),
  });
}

export async function disablePromoCode(
  token: string,
  id: string
): Promise<void> {
  if (USE_MOCK) {
    await delay(300);
    return;
  }
  await fetchApi(`/api/admin/promo/${id}/disable`, {
    method: "PATCH",
    headers: authHeaders(token),
  });
}

export async function enablePromoCode(
  token: string,
  id: string
): Promise<void> {
  if (USE_MOCK) {
    await delay(300);
    return;
  }
  await fetchApi(`/api/admin/promo/${id}/enable`, {
    method: "PATCH",
    headers: authHeaders(token),
  });
}

// Convenience wrapper that routes to the enable/disable endpoint.
export async function togglePromoCode(
  token: string,
  id: string,
  isActive: boolean
): Promise<void> {
  return isActive ? enablePromoCode(token, id) : disablePromoCode(token, id);
}

export async function deletePromoCode(
  token: string,
  id: string
): Promise<void> {
  if (USE_MOCK) {
    await delay(300);
    return;
  }
  await fetchApi(`/api/admin/promo/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

// ── Admin user management ─────────────────────────────────────────

export async function listUsers(
  token: string,
  limit = 50,
  offset = 0
): Promise<AdminUser[]> {
  const data = await fetchApi<{ users: AdminUser[] } | AdminUser[]>(
    `/api/admin/users?limit=${limit}&offset=${offset}`,
    { headers: authHeaders(token) }
  );
  return Array.isArray(data) ? data : data.users;
}

export async function getUser(
  token: string,
  userId: string
): Promise<AdminUser> {
  return fetchApi<AdminUser>(`/api/admin/users/${userId}`, {
    headers: authHeaders(token),
  });
}

export async function disableUser(
  token: string,
  userId: string
): Promise<void> {
  await fetchApi(`/api/admin/users/${userId}/disable`, {
    method: "PATCH",
    headers: authHeaders(token),
  });
}

export async function deleteUser(
  token: string,
  userId: string
): Promise<void> {
  await fetchApi(`/api/admin/users/${userId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export { ApiError };