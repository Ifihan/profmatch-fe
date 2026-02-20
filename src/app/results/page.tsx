"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout, Container } from "@/components/layout";
import { Button, SkeletonResultsGrid } from "@/components/ui";
import { ProfessorCard, ProfessorDetail } from "@/components/professor";
import { exportResults } from "@/lib/export";
import type { MatchResult } from "@/types";

interface ResultsData {
  match_id: string;
  status: string;
  results: MatchResult[];
}

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedResults = sessionStorage.getItem("matchResults");
    if (!storedResults) {
      router.replace("/");
      return;
    }

    try {
      setResults(JSON.parse(storedResults));
    } catch {
      router.replace("/");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <PageLayout>
        <Container className="py-12">
          <div className="mb-8">
            <div className="mb-2 h-8 w-48 animate-pulse rounded bg-surface" />
            <div className="h-5 w-64 animate-pulse rounded bg-surface" />
          </div>
          <SkeletonResultsGrid />
        </Container>
      </PageLayout>
    );
  }

  if (!results || !results.results || results.results.length === 0) {
    return (
      <PageLayout>
        <Container className="flex min-h-[60vh] flex-col items-center justify-center py-12">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-semibold text-text-primary">
              No Results Found
            </h1>
            <p className="mb-6 text-text-secondary">
              We couldn&apos;t find any matching professors. Please try again with different criteria.
            </p>
            <Button onClick={() => router.push("/")}>Start New Search</Button>
          </div>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container className="py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-semibold text-text-primary md:text-3xl">
              Your Top Matches
            </h1>
            <p className="text-text-secondary">
              Found {results.results.length} matching professor{results.results.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportResults(results.results, "markdown")}
            >
              <svg
                className="mr-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Markdown
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportResults(results.results, "latex")}
            >
              <svg
                className="mr-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              LaTeX
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportResults(results.results, "pdf")}
            >
              <svg
                className="mr-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              PDF
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {results.results.map((match) => (
            <ProfessorCard
              key={match.professor.id}
              match={match}
              onViewProfile={() => setSelectedMatch(match)}
            />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button variant="outline" onClick={() => router.push("/")}>
            Start New Search
          </Button>
        </div>
      </Container>

      {selectedMatch && (
        <ProfessorDetail
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </PageLayout>
  );
}