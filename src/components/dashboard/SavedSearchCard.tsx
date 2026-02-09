"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import type { SavedSearch } from "@/types";

interface SavedSearchCardProps {
  search: SavedSearch;
  onView: () => void;
  onDelete: () => void;
}

export function SavedSearchCard({
  search,
  onView,
  onDelete,
}: SavedSearchCardProps) {
  const formattedDate = new Date(search.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Extract university name from URL
  const getUniversityName = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

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
            {search.name}
          </h3>
          <p className="text-sm text-text-secondary">
            {getUniversityName(search.university)}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5",
            "bg-accent/10 text-xs font-medium text-accent"
          )}
        >
          {search.results.length} match{search.results.length !== 1 ? "es" : ""}
        </span>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
          Research Interests
        </p>
        <div className="flex flex-wrap gap-1.5">
          {search.researchInterests.slice(0, 3).map((interest, index) => (
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
          {search.researchInterests.length > 3 && (
            <span className="text-xs text-text-muted">
              +{search.researchInterests.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4 text-sm text-text-secondary">
        <div className="flex min-w-0 items-center gap-1.5">
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="truncate">{search.resumeFileName}</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <span className="text-xs text-text-muted">{formattedDate}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onDelete}>
            Delete
          </Button>
          <Button size="sm" onClick={onView}>
            View Results
          </Button>
        </div>
      </div>
    </article>
  );
}
