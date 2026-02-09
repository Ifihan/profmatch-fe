"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageLayout, Container } from "@/components/layout";
import { Button, Input, Modal, SkeletonResultsGrid } from "@/components/ui";
import { ProfessorCard, ProfessorDetail } from "@/components/professor";
import { exportResults } from "@/lib/export";
import { useAuth } from "@/context";
import { useSavedSearches } from "@/hooks";
import type { MatchResult } from "@/types";

interface ResultsData {
  match_id: string;
  status: string;
  results: MatchResult[];
}

interface MatchData {
  university: string;
  researchInterests: string[];
  resumeFileName?: string;
}

export default function ResultsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { saveSearch } = useSavedSearches();

  const [results, setResults] = useState<ResultsData | null>(null);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Save modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const storedResults = sessionStorage.getItem("matchResults");
    const storedMatchData = sessionStorage.getItem("matchData");

    if (!storedResults) {
      router.replace("/");
      return;
    }

    try {
      setResults(JSON.parse(storedResults));
      if (storedMatchData) {
        const parsed = JSON.parse(storedMatchData);
        setMatchData({
          university: parsed.university || "",
          researchInterests: parsed.researchInterests || [],
          resumeFileName: parsed.resumeFileName || "resume.pdf",
        });
      }
    } catch {
      router.replace("/");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleSave = () => {
    if (!searchName.trim()) {
      setSaveError("Please enter a name for this search");
      return;
    }

    if (!results || !matchData) {
      setSaveError("Search data not available");
      return;
    }

    const saved = saveSearch({
      name: searchName.trim(),
      university: matchData.university,
      researchInterests: matchData.researchInterests,
      resumeFileName: matchData.resumeFileName || "resume.pdf",
      results: results.results,
    });

    if (saved) {
      setIsSaved(true);
      setShowSaveModal(false);
      setSearchName("");
      setSaveError(null);
    } else {
      setSaveError("Failed to save search. Please try again.");
    }
  };

  const openSaveModal = () => {
    // Generate a default name based on the university
    const getUniversityName = (url: string) => {
      try {
        const hostname = new URL(url).hostname;
        return hostname.replace("www.", "").split(".")[0];
      } catch {
        return "Search";
      }
    };

    const defaultName = matchData
      ? `${getUniversityName(matchData.university)} - ${new Date().toLocaleDateString()}`
      : `Search - ${new Date().toLocaleDateString()}`;

    setSearchName(defaultName);
    setSaveError(null);
    setShowSaveModal(true);
  };

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

          <div className="flex flex-wrap gap-2">
            {isAuthenticated ? (
              isSaved ? (
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    <svg
                      className="mr-1 h-4 w-4 text-success"
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
                    Saved - View Dashboard
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" onClick={openSaveModal}>
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
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  Save Search
                </Button>
              )
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm">
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
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  Sign in to Save
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportResults(results.results, "csv")}
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
              onClick={() => exportResults(results.results, "json")}
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

      {/* Save Search Modal */}
      <Modal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="Save Search"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Save this search to your dashboard so you can access these results later.
          </p>

          {saveError && (
            <div className="rounded-md bg-error/10 p-3 text-sm text-error">
              {saveError}
            </div>
          )}

          <Input
            label="Search Name"
            placeholder="e.g., MIT Machine Learning Search"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowSaveModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Search</Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}
