"use client";

import { useState, useCallback, useEffect } from "react";
import type { CreditsResponse } from "@/types";
import { useAuth } from "@/context";
import { getCredits } from "@/lib/api";

export function useCredits() {
  const { token, isAuthenticated } = useAuth();
  const [credits, setCredits] = useState<CreditsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCredits = useCallback(async (): Promise<CreditsResponse | null> => {
    if (!token) {
      setCredits(null);
      setIsLoading(false);
      return null;
    }

    try {
      const data = await getCredits(token);
      setCredits(data);
      return data;
    } catch {
      setCredits(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      loadCredits();
    } else {
      setCredits(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, loadCredits]);

  return {
    credits,
    balance: credits?.balance ?? null,
    nextFreeCredit: credits?.next_free_credit_at ?? null,
    isLoading,
    refresh: loadCredits,
  };
}
