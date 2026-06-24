"use client";

import { useState, useCallback, useRef } from "react";
import { createMatch, getMatch } from "@/lib/api";
import type { JobStatusResponse, MatchResultsResponse } from "@/types";

const POLL_INTERVAL = 2000;

export function useMatch() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatusResponse | null>(null);
  const [results, setResults] = useState<MatchResultsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // Submits a match job (CV uploaded inline); pass a token to save it to the account.
  const start = useCallback(
    async (
      universityUrl: string,
      researchInterests: string,
      cv: File,
      token?: string,
      onProgress?: (progress: number) => void
    ) => {
      setError(null);
      setStatus(null);
      setResults(null);

      try {
        const job = await createMatch(
          universityUrl,
          researchInterests,
          cv,
          token,
          onProgress
        );
        setJobId(job.job_id);
        setStatus(job);
        return job.job_id;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to start matching";
        setError(message);
        throw err;
      }
    },
    []
  );

  const pollStatus = useCallback(
    (id: string, token?: string): Promise<MatchResultsResponse> => {
      return new Promise((resolve, reject) => {
        const poll = async () => {
          try {
            const job = await getMatch(id, token);
            setStatus(job);

            if (job.status === "done" || job.status === "completed") {
              stopPolling();
              const result = job.result ?? null;
              setResults(result);
              if (result) {
                resolve(result);
              } else {
                reject(new Error("Match completed without results"));
              }
            } else if (job.status === "failed") {
              stopPolling();
              const message = job.error || "Matching failed";
              setError(message);
              reject(new Error(message));
            }
          } catch (err) {
            stopPolling();
            const message =
              err instanceof Error ? err.message : "Failed to get status";
            setError(message);
            reject(err);
          }
        };

        poll();
        pollRef.current = setInterval(poll, POLL_INTERVAL);
      });
    },
    [stopPolling]
  );

  const reset = useCallback(() => {
    stopPolling();
    setJobId(null);
    setStatus(null);
    setResults(null);
    setError(null);
  }, [stopPolling]);

  return {
    jobId,
    status,
    results,
    error,
    start,
    pollStatus,
    reset,
    stopPolling,
  };
}
