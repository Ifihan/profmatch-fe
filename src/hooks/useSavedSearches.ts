"use client";

import { useState, useCallback, useEffect } from "react";
import type { SearchHistorySummary, SearchHistoryDetail } from "@/types";
import { useAuth } from "@/context";
import { listSearches, getSearchDetail, deleteSearch } from "@/lib/api";

export function useSavedSearches() {
  const { token } = useAuth();
  const [searches, setSearches] = useState<SearchHistorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSearches = useCallback(async () => {
    if (!token) {
      setSearches([]);
      setIsLoading(false);
      return;
    }

    try {
      const data = await listSearches(token);
      setSearches(data);
    } catch (err) {
      console.error("Failed to load saved searches:", err);
      setSearches([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadSearches();
  }, [loadSearches]);

  const getSearch = useCallback(
    async (searchId: string): Promise<SearchHistoryDetail | null> => {
      if (!token) return null;
      try {
        return await getSearchDetail(token, searchId);
      } catch {
        return null;
      }
    },
    [token]
  );

  // Deletes a single search, optimistically removing it from the list.
  const remove = useCallback(
    async (searchId: string) => {
      if (!token) return;
      const prev = searches;
      setSearches((list) => list.filter((s) => s.job_id !== searchId));
      try {
        await deleteSearch(token, searchId);
      } catch (err) {
        console.error("Failed to delete search:", err);
        setSearches(prev); // revert on error
      }
    },
    [token, searches]
  );

  return {
    searches,
    isLoading,
    getSearch,
    remove,
    refresh: loadSearches,
  };
}
