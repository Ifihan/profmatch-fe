// UX hint that the anon user used their one free search (backend enforces via cookie).
const ANON_SEARCH_USED_KEY = "profmatch_anon_search_used";

export function markAnonSearchUsed() {
  if (typeof window === "undefined") return;
  localStorage.setItem(ANON_SEARCH_USED_KEY, "true");
}

export function hasUsedAnonSearch(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ANON_SEARCH_USED_KEY) === "true";
}
