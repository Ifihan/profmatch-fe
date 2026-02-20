"use client";

import { useEffect, useCallback } from "react";
import { Button } from "@/components/ui";
import { formatMatchScore, formatCitationCount } from "@/lib/utils";
import type { MatchResult } from "@/types";

interface ProfessorDetailProps {
  match: MatchResult;
  onClose: () => void;
}

export function ProfessorDetail({ match, onClose }: ProfessorDetailProps) {
  const {
    professor,
    match_score,
    alignment_reasons,
    shared_keywords,
    relevant_publications,
    recommendation_text,
  } = match;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="professor-name"
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-background"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background p-6">
          <div>
            <h2
              id="professor-name"
              className="text-xl font-semibold text-text-primary"
            >
              {professor.name}
            </h2>
            <p className="text-sm text-text-secondary">
              {[professor.title, professor.department, professor.university]
                .filter(Boolean)
                .join(" \u00B7 ")}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <span className="font-semibold text-primary">
                {formatMatchScore(match_score)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-text-muted transition-colors hover:text-text-primary"
              aria-label="Close"
            >
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* Contact & Links */}
          <div className="flex flex-wrap gap-3">
            {professor.email && (
              <a
                href={`mailto:${professor.email}`}
                className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-light"
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {professor.email}
              </a>
            )}
            {professor.scholar_id && (
              <a
                href={`https://scholar.google.com/citations?user=${professor.scholar_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-light"
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
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Google Scholar
              </a>
            )}
          </div>

          {/* Citation Metrics */}
          {professor.citation_metrics && (
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-surface p-4">
              <div className="text-center">
                <p className="text-2xl font-semibold text-text-primary">
                  {professor.citation_metrics.h_index}
                </p>
                <p className="text-xs text-text-muted">h-index</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-text-primary">
                  {formatCitationCount(
                    professor.citation_metrics.total_citations
                  )}
                </p>
                <p className="text-xs text-text-muted">Citations</p>
              </div>
            </div>
          )}

          {/* Research Areas */}
          {professor.research_areas.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-text-primary">
                Research Areas
              </h3>
              <div className="flex flex-wrap gap-2">
                {professor.research_areas.map((area) => (
                  <span
                    key={area}
                    className="rounded-md bg-surface px-3 py-1 text-sm text-text-secondary"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          {recommendation_text && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-text-primary">
                Recommendation
              </h3>
              <p className="text-sm text-text-secondary">{recommendation_text}</p>
            </div>
          )}

          {/* Why This Match */}
          {alignment_reasons.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-text-primary">
                Why This Match
              </h3>
              <ul className="space-y-2">
                {alignment_reasons.map((reason, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-text-secondary"
                  >
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-success"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Shared Keywords */}
          {shared_keywords.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-text-primary">
                Shared Research Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {shared_keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-md bg-accent/10 px-3 py-1 text-sm text-accent-dark"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Relevant Publications */}
          {relevant_publications.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-medium text-text-primary">
                Relevant Publications
              </h3>
              <ul className="space-y-4">
                {relevant_publications.map((pub, idx) => (
                  <li key={idx} className="border-l-2 border-primary/40 pl-4">
                    {pub.url ? (
                      <a
                        href={pub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:text-primary-light hover:underline"
                      >
                        {pub.title}
                      </a>
                    ) : (
                      <p className="font-medium text-text-primary">
                        {pub.title}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-text-secondary">
                      {pub.authors.join(", ")}
                    </p>
                    <p className="mt-1 text-sm text-text-muted">
                      {pub.venue} &middot; {pub.year} &middot;{" "}
                      {pub.citation_count} citations
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recent Publications */}
          {professor.publications.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-medium text-text-primary">
                Recent Publications
              </h3>
              <ul className="space-y-4">
                {professor.publications.map((pub, idx) => (
                  <li key={idx} className="border-l-2 border-border pl-4">
                    {pub.url ? (
                      <a
                        href={pub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:text-primary-light hover:underline"
                      >
                        {pub.title}
                      </a>
                    ) : (
                      <p className="font-medium text-text-primary">
                        {pub.title}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-text-secondary">
                      {pub.authors.join(", ")}
                    </p>
                    <p className="mt-1 text-sm text-text-muted">
                      {pub.venue} &middot; {pub.year} &middot;{" "}
                      {pub.citation_count} citations
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 border-t border-border bg-background p-6">
          <Button variant="primary" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
