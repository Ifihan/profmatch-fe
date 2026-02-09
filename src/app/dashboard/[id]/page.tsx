"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { PageLayout, Container } from "@/components/layout";
import { Button, Skeleton } from "@/components/ui";
import { ProfessorCard, ProfessorDetail } from "@/components/professor";
import { exportResults } from "@/lib/export";
import { useAuth } from "@/context";
import { useSavedSearches } from "@/hooks";
import type { SavedSearch, MatchResult } from "@/types";

export default function SavedSearchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchId = params.id as string;

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { getSearch, isLoading: searchesLoading } = useSavedSearches();

  const [search, setSearch] = useState<SavedSearch | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!searchesLoading && searchId) {
      const found = getSearch(searchId);
      setSearch(found);
    }
  }, [searchId, searchesLoading, getSearch]);

  const isLoading = authLoading || searchesLoading;

  if (isLoading) {
    return (
      <PageLayout>
        <Container className="py-12">
          <div className="mb-8">
            <Skeleton className="mb-4 h-6 w-32" />
            <Skeleton className="mb-2 h-8 w-64" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-72" />
            ))}
          </div>
        </Container>
      </PageLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!search) {
    return (
      <PageLayout>
        <Container className="flex min-h-[60vh] flex-col items-center justify-center py-12">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-semibold text-text-primary">
              Search Not Found
            </h1>
            <p className="mb-6 text-text-secondary">
              This saved search doesn&apos;t exist or has been deleted.
            </p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </Container>
      </PageLayout>
    );
  }

  const getUniversityName = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  return (
    <PageLayout>
      <Container className="py-12">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-semibold text-text-primary md:text-3xl">
              {search.name}
            </h1>
            <p className="text-text-secondary">
              {search.results.length} match
              {search.results.length !== 1 ? "es" : ""} from{" "}
              {getUniversityName(search.university)}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportResults(search.results, "csv")}
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
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportResults(search.results, "json")}
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
              Export JSON
            </Button>
          </div>
        </div>

        {/* Search details */}
        <div className="mb-8 rounded-lg border border-border bg-surface/50 p-5">
          <h2 className="mb-4 text-sm font-medium tracking-wide text-text-muted">
            Search Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="mb-1 text-xs text-text-muted">University</p>
              <p className="text-sm text-text-primary">
                {getUniversityName(search.university)}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-text-muted">Resume</p>
              <p className="text-sm text-text-primary">{search.resumeFileName}</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-text-muted">Saved On</p>
              <p className="text-sm text-text-primary">
                {new Date(search.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="mb-2 text-xs text-text-muted">Research Interests</p>
            <div className="flex flex-wrap gap-2">
              {search.researchInterests.map((interest, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Results grid */}
        {search.results.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
            <p className="text-text-secondary">No matches found in this search.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {search.results.map((match) => (
              <ProfessorCard
                key={match.professor.id}
                match={match}
                onViewProfile={() => setSelectedMatch(match)}
              />
            ))}
          </div>
        )}
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
