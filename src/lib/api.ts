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
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

export { ApiError };