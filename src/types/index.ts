// Professor Profile
export interface Publication {
  title: string;
  authors: string[];
  year: number;
  venue: string;
  abstract?: string;
  citation_count: number;
  url?: string;
}

export interface CitationMetrics {
  h_index: number;
  total_citations: number;
}

export interface ProfessorProfile {
  id: string;
  name: string;
  title: string;
  department: string;
  university: string;
  email?: string;
  scholar_id?: string;
  research_areas: string[];
  publications: Publication[];
  citation_metrics?: CitationMetrics;
  last_updated: string;
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
export interface SessionResponse {
  session_id: string;
  created_at: string;
}

export interface UploadResponse {
  file_id: string;
  filename: string;
  status: "uploaded" | "processing" | "parsed";
}

export interface MatchStatus {
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  current_step: string;
  error?: string;
}

export interface MatchResultsResponse {
  session_id: string;
  matches: MatchResult[];
  total_professors_analyzed: number;
  processing_time_seconds: number;
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
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Saved Search Types
export interface SavedSearch {
  id: string;
  userId: string;
  university: string;
  researchInterests: string[];
  resumeFileName: string;
  results: MatchResult[];
  createdAt: string;
  name: string;
}