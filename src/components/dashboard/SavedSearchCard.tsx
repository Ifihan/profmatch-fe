"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import type { SearchHistorySummary } from "@/types";

interface SavedSearchCardProps {
  search: SearchHistorySummary;
  onView: () => void;
  onDelete: () => void;
}

export function SavedSearchCard({ search, onView, onDelete }: SavedSearchCardProps) {
  const formattedDate = new Date(search.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const getUniversityName = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  const interests = search.research_interests
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <article
      className={cn(
        "rounded-lg border border-border bg-background p-5",
        "transition-all duration-150",
        "hover:border-secondary-light hover:shadow-sm"
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 truncate text-lg font-semibold text-text-primary">
            {getUniversityName(search.university_url)}
          </h3>
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5",
            "bg-accent/10 text-xs font-medium text-accent"
          )}
        >
          {search.match_count} match{search.match_count !== 1 ? "es" : ""}
        </span>
      </div>

      {interests.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
            Research Interests
          </p>
          <div className="flex flex-wrap gap-1.5">
            {interests.slice(0, 3).map((interest, index) => (
              <span
                key={index}
                className={cn(
                  "inline-flex items-center rounded-md px-2 py-0.5",
                  "bg-surface text-xs text-text-secondary"
                )}
              >
                {interest}
              </span>
            ))}
            {interests.length > 3 && (
              <span className="text-xs text-text-muted">
                +{interests.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border pt-4">
        <span className="text-xs text-text-muted">{formattedDate}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            aria-label="Delete search"
            className="px-2 text-error hover:bg-error/5"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </Button>
          <Button size="sm" onClick={onView}>
            View Results
          </Button>
        </div>
      </div>
    </article>
  );
}
