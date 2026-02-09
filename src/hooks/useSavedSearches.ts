"use client";

import { useState, useCallback, useEffect } from "react";
import type { SavedSearch, MatchResult } from "@/types";
import { useAuth } from "@/context";

const STORAGE_KEY = "profmatch_saved_searches";

export function useSavedSearches() {
  const { user } = useAuth();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load searches from localStorage
  const loadSearches = useCallback(() => {
    if (!user) {
      setSearches([]);
      setIsLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const allSearches: SavedSearch[] = stored ? JSON.parse(stored) : [];
      const userSearches = allSearches.filter((s) => s.userId === user.id);
      setSearches(userSearches);
    } catch {
      setSearches([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSearches();
  }, [loadSearches]);

  const saveSearch = useCallback(
    (data: {
      name: string;
      university: string;
      researchInterests: string[];
      resumeFileName: string;
      results: MatchResult[];
    }): SavedSearch | null => {
      if (!user) return null;

      const newSearch: SavedSearch = {
        id: `search_${Date.now()}`,
        userId: user.id,
        name: data.name,
        university: data.university,
        researchInterests: data.researchInterests,
        resumeFileName: data.resumeFileName,
        results: data.results,
        createdAt: new Date().toISOString(),
      };

      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const allSearches: SavedSearch[] = stored ? JSON.parse(stored) : [];
        allSearches.push(newSearch);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allSearches));
        setSearches((prev) => [...prev, newSearch]);
        return newSearch;
      } catch {
        return null;
      }
    },
    [user]
  );

  const deleteSearch = useCallback(
    (searchId: string) => {
      if (!user) return;

      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const allSearches: SavedSearch[] = stored ? JSON.parse(stored) : [];
        const filtered = allSearches.filter((s) => s.id !== searchId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        setSearches((prev) => prev.filter((s) => s.id !== searchId));
      } catch {
        // Ignore errors
      }
    },
    [user]
  );

  const getSearch = useCallback(
    (searchId: string): SavedSearch | null => {
      return searches.find((s) => s.id === searchId) || null;
    },
    [searches]
  );

  return {
    searches,
    isLoading,
    saveSearch,
    deleteSearch,
    getSearch,
    refresh: loadSearches,
  };
}
