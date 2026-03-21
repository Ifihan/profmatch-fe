import type {
  SessionResponse,
  UploadResponse,
  MatchStatus,
  MatchResultsResponse,
  ProfessorProfile,
  AuthResponse,
  User,
  SearchHistorySummary,
  SearchHistoryDetail,
  CreditsResponse,
  PlansResponse,
  PromoCode,
  PromoCodeRedemptionResponse,
  AdminStats,
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

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

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
  email: string,
  password: string,
  name: string,
  sessionId?: string
): Promise<AuthResponse> {
  return fetchApi<AuthResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, name, session_id: sessionId }),
  });
}

export async function login(
  email: string,
  password: string,
  sessionId?: string
): Promise<AuthResponse> {
  if (USE_MOCK) {
    await delay(300);
    if (email === "admin@test.com") {
      return mockAdminAuthResponse;
    }
    return mockRegularAuthResponse;
  }
  return fetchApi<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, session_id: sessionId }),
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

// Session endpoints
export async function createSession(token?: string): Promise<SessionResponse> {
  return fetchApi<SessionResponse>("/api/session", {
    method: "POST",
    ...(token ? { headers: authHeaders(token) } : {}),
  });
}

export async function getSession(sessionId: string): Promise<SessionResponse> {
  return fetchApi<SessionResponse>(`/api/session/${sessionId}`);
}

export async function deleteSession(sessionId: string): Promise<void> {
  await fetchApi(`/api/session/${sessionId}`, {
    method: "DELETE",
  });
}

// Upload endpoints
export async function uploadFile(
  sessionId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("session_id", sessionId);

  const xhr = new XMLHttpRequest();

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
        reject(new ApiError(xhr.status, xhr.statusText));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new ApiError(0, "Network error"));
    });

    xhr.open("POST", `${API_BASE_URL}/api/upload`);
    xhr.send(formData);
  });
}

// Match endpoints
export async function startMatch(
  sessionId: string,
  university: string,
  researchInterests: string[],
  fileIds: string[],
  token?: string
): Promise<{ match_id: string }> {
  return fetchApi<{ match_id: string }>("/api/match", {
    method: "POST",
    body: JSON.stringify({
      session_id: sessionId,
      university,
      research_interests: researchInterests,
      file_ids: fileIds,
    }),
    ...(token ? { headers: authHeaders(token) } : {}),
  });
}

export async function getMatchStatus(
  matchId: string,
  sessionId: string
): Promise<MatchStatus> {
  return fetchApi<MatchStatus>(
    `/api/match/${matchId}/status?session_id=${sessionId}`
  );
}

export async function getMatchResults(
  matchId: string,
  sessionId: string
): Promise<MatchResultsResponse> {
  return fetchApi<MatchResultsResponse>(
    `/api/match/${matchId}/results?session_id=${sessionId}`
  );
}

// Professor endpoints
export async function getProfessor(
  professorId: string
): Promise<ProfessorProfile> {
  return fetchApi<ProfessorProfile>(`/api/professor/${professorId}`);
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
  return fetchApi<PromoCodeRedemptionResponse>("/api/credits/redeem", {
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
  return fetchApi<AdminStats>("/api/admin/stats", {
    headers: authHeaders(token),
  });
}

export async function getAdminPromoCodes(token: string): Promise<PromoCode[]> {
  if (USE_MOCK) {
    await delay(400);
    return mockPromoCodes;
  }
  const data = await fetchApi<{ promo_codes: PromoCode[] }>("/api/admin/promo-codes", {
    headers: authHeaders(token),
  });
  return data.promo_codes;
}

export async function createPromoCode(
  token: string,
  payload: CreatePromoCodePayload
): Promise<PromoCode> {
  if (USE_MOCK) {
    await delay(500);
    return {
      id: `pc-${Date.now()}`,
      code: payload.code,
      credits: payload.credits,
      max_uses: payload.max_uses,
      use_count: 0,
      is_active: true,
      created_at: new Date().toISOString(),
    };
  }
  return fetchApi<PromoCode>("/api/admin/promo-codes", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: authHeaders(token),
  });
}

export async function togglePromoCode(
  token: string,
  id: string,
  isActive: boolean
): Promise<PromoCode> {
  if (USE_MOCK) {
    await delay(300);
    const code = mockPromoCodes.find((c) => c.id === id);
    return { ...(code ?? mockPromoCodes[0]), is_active: isActive };
  }
  return fetchApi<PromoCode>(`/api/admin/promo-codes/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ is_active: isActive }),
    headers: authHeaders(token),
  });
}

export async function deletePromoCode(
  token: string,
  id: string
): Promise<void> {
  if (USE_MOCK) {
    await delay(300);
    return;
  }
  await fetchApi(`/api/admin/promo-codes/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export { ApiError };