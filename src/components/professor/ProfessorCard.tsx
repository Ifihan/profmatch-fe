import { Button } from "@/components/ui";
import { formatMatchScore, formatCitationCount } from "@/lib/utils";
import type { MatchResult } from "@/types";

interface ProfessorCardProps {
  match: MatchResult;
  onViewProfile: () => void;
}

export function ProfessorCard({ match, onViewProfile }: ProfessorCardProps) {
  const { professor, match_score, recommendation_text, relevant_publications } =
    match;

  return (
    <article className="flex flex-col rounded-lg border border-border bg-background p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            {professor.name}
          </h2>
          <p className="text-sm text-text-secondary">{professor.title}</p>
          {(professor.department || professor.university || professor.email) && (
            <p className="text-sm text-text-secondary">
              {[professor.department, professor.university, professor.email]
                .filter(Boolean)
                .join(", ")}
            </p>
          )}
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <span className="text-sm font-semibold text-primary">
            {formatMatchScore(match_score)}
          </span>
        </div>
      </div>

      {professor.research_areas.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {professor.research_areas.slice(0, 4).map((area) => (
            <span
              key={area}
              className="rounded-md bg-surface px-2 py-1 text-xs text-text-secondary"
            >
              {area}
            </span>
          ))}
        </div>
      )}

      <p className="mb-4 flex-1 text-sm text-text-secondary line-clamp-3">
        {recommendation_text}
      </p>

      {relevant_publications.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 text-xs font-medium tracking-wide text-text-muted">
            Relevant Publications
          </h3>
          <ul className="space-y-1">
            {relevant_publications.slice(0, 2).map((pub, idx) => (
              <li key={idx} className="text-sm text-text-secondary">
                {pub.url ? (
                  <a
                    href={pub.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-light hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {pub.title}
                  </a>
                ) : (
                  <span className="text-text-primary">{pub.title}</span>
                )}
                <span className="text-text-muted">
                  {" "}
                  ({pub.year})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {professor.citation_metrics && (
        <div className="mb-4 flex gap-4 border-t border-border pt-4">
          <div>
            <p className="text-xs text-text-muted">h-index</p>
            <p className="font-medium text-text-primary">
              {professor.citation_metrics.h_index}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Citations</p>
            <p className="font-medium text-text-primary">
              {formatCitationCount(professor.citation_metrics.total_citations)}
            </p>
          </div>
        </div>
      )}

      <Button variant="outline" onClick={onViewProfile} className="mt-auto">
        View Full Profile
      </Button>
    </article>
  );
}
