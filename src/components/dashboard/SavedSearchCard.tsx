"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import type { SearchHistorySummary } from "@/types";

interface SavedSearchCardProps {
  search: SearchHistorySummary;
  onView: () => void;
}

export function SavedSearchCard({ search, onView }: SavedSearchCardProps) {
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
        <Button size="sm" onClick={onView}>
          View Results
        </Button>
      </div>
    </article>
  );
}
