"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageLayout, Container } from "@/components/layout";
import { Button, Skeleton } from "@/components/ui";
import { SavedSearchCard } from "@/components/dashboard";
import { useAuth } from "@/context";
import { useSavedSearches } from "@/hooks";

type SortOption = "newest" | "oldest" | "most_matches" | "name_asc";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { searches, isLoading: searchesLoading, deleteSearch } = useSavedSearches();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const filteredAndSortedSearches = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const filtered = query
      ? searches.filter((s) => {
          const universityName = (() => {
            try {
              return new URL(s.university).hostname.replace("www.", "");
            } catch {
              return s.university;
            }
          })();
          return (
            s.name.toLowerCase().includes(query) ||
            universityName.toLowerCase().includes(query)
          );
        })
      : searches;

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "most_matches":
          return b.results.length - a.results.length;
        case "name_asc":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [searches, searchQuery, sortBy]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleDelete = (searchId: string) => {
    if (deleteConfirm === searchId) {
      deleteSearch(searchId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(searchId);
      // Auto-reset confirmation after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleView = (searchId: string) => {
    router.push(`/dashboard/${searchId}`);
  };

  if (authLoading) {
    return (
      <PageLayout>
        <Container className="py-12">
          <div className="mb-8">
            <Skeleton className="mb-2 h-8 w-48" />
            <Skeleton className="h-5 w-64" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </Container>
      </PageLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <PageLayout>
      <Container className="py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-semibold text-text-primary md:text-3xl">
              Welcome, {user?.name?.split(" ")[0]}
            </h1>
            <p className="text-text-secondary">
              Your saved research matches and searches
            </p>
          </div>
          <Link href="/">
            <Button>
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Search
            </Button>
          </Link>
        </div>

        {searchesLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : searches.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
            <svg
              className="mb-4 h-12 w-12 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h2 className="mb-2 text-lg font-semibold text-text-primary">
              No saved searches yet
            </h2>
            <p className="mb-6 text-center text-text-secondary">
              Start a new search and save the results to view them here
            </p>
            <Link href="/">
              <Button>Start Your First Search</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name or university..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 hover:border-secondary-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort searches"
                className="h-10 appearance-none rounded-md border border-border bg-background bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat pl-3 pr-8 text-sm text-text-primary transition-colors duration-150 hover:border-secondary-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="most_matches">Most matches</option>
                <option value="name_asc">Name (A-Z)</option>
              </select>
            </div>

            {filteredAndSortedSearches.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
                <p className="text-text-secondary">
                  No searches matching &quot;{searchQuery}&quot;
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredAndSortedSearches.map((search) => (
                  <SavedSearchCard
                    key={search.id}
                    search={search}
                    onView={() => handleView(search.id)}
                    onDelete={() => handleDelete(search.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </Container>
    </PageLayout>
  );
}
