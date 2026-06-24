// Professor Profile
export interface Publication {
  title: string;
  authors: string[];
  year?: number | null;
  venue?: string | null;
  abstract?: string | null;
  citation_count?: number | null;
  url?: string | null;
}

export interface CitationMetrics {
  h_index?: number | null;
  total_citations?: number | null;
}

export interface ProfessorProfile {
  id: string;
  name: string;
  title?: string | null;
  department?: string | null;
  university?: string | null;
  email?: string | null;
  scholar_id?: string | null;
  research_areas: string[];
  publications: Publication[];
  citation_metrics?: CitationMetrics | null;
  last_updated?: string | null;
}

// Student Profile
export interface Education {
  institution: string;
  degree: string;
  field: string;
  year: number;
}

export interface Experience {
  organization: string;
  role: string;
  description: string;
  start_date: string;
  end_date?: string;
}

export interface StudentProfile {
  session_id: string;
  stated_interests: string[];
  education: Education[];
  experience: Experience[];
  publications: Publication[];
  skills: string[];
  extracted_keywords: string[];
}

// Match Result
export interface MatchResult {
  professor: ProfessorProfile;
  match_score: number;
  alignment_reasons: string[];
  relevant_publications: Publication[];
  shared_keywords: string[];
  recommendation_text: string;
}

// API Response Types
export interface MatchResultsResponse {
  session_id: string;
  matches: MatchResult[];
  total_professors_analyzed: number;
  processing_time_seconds: number;
}

// API uses "queued" → "processing" → "done"; "completed" kept for safety.
export type JobStatus =
  | "queued"
  | "processing"
  | "done"
  | "completed"
  | "failed";

export interface JobStatusResponse {
  job_id: string;
  status: JobStatus;
  progress: number;
  result?: MatchResultsResponse | null;
  error?: string | null;
}

// Form Types
export interface MatchFormData {
  university: string;
  research_interests: string[];
  files: File[];
}

// Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  // /api/auth/me returns the balance as `credit_balance` (note: /api/credits uses `balance`).
  credit_balance?: number;
  search_credits?: SearchCredits;
  is_admin?: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Credits Types
export interface SearchCredits {
  balance: number;
  next_free_credit_at: string | null;
}

export interface CreditUsage {
  match_id: string;
  university: string;
  created_at: string;
}

export interface CreditsResponse {
  balance: number;
  // Not currently returned by the API; kept optional for forward-compat.
  next_free_credit_at?: string | null;
  usage_history?: CreditUsage[];
}

export interface CreditPlan {
  id: string;
  name: string;
  credits: number;
  price_usd: number;
  available: boolean;
}

export interface PlansResponse {
  plans: CreditPlan[];
  available?: boolean;
  message?: string;
}

// Promo Code Types
export interface PromoCode {
  id: string;
  code: string;
  credits: number;
  max_redemptions: number | null; // null = unlimited
  times_redeemed: number;
  is_disabled: boolean;
}

export interface PromoCodeRedemptionResponse {
  credits_granted: number;
  balance: number;
}

export interface CreatePromoCodePayload {
  code: string;
  credits: number;
  max_redemptions?: number;
}

// Admin user management
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  created_at: string;
  is_admin?: boolean;
  is_disabled?: boolean;
  credit_balance?: number; // present on the single-user (get) response
}

// Admin Types
export interface AdminStats {
  total_users: number;
  total_searches: number;
  active_users: number;
  paid_users: number;
}

// Search History Types
export interface SearchHistorySummary {
  job_id: string;
  status: JobStatus;
  progress: number;
  university_url: string;
  research_interests: string; // comma-separated string, e.g. "Computer Vision, NLP"
  total_professors_analyzed: number | null;
  match_count: number;
  created_at: string;
}

// JobStatusResponse envelope enriched with the originating request fields.
export interface SearchHistoryDetail {
  job_id: string;
  status: JobStatus;
  progress: number;
  result?: MatchResultsResponse | null;
  error?: string | null;
  university_url: string;
  research_interests: string;
  created_at: string;
}