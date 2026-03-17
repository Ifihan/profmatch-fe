"use client";

import { useState, useCallback, useEffect } from "react";
import type { SearchHistorySummary, SearchHistoryDetail } from "@/types";
import { useAuth } from "@/context";
import { listSearches, getSearchDetail } from "@/lib/api";

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
    } catch {
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

  return {
    searches,
    isLoading,
    getSearch,
    refresh: loadSearches,
  };
}
