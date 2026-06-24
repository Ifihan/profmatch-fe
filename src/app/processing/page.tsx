"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageLayout, Container } from "@/components/layout";
import { ProgressBar, Button } from "@/components/ui";
import {
  createMatch,
  getMatch,
  createMatchEventSource,
  ApiError,
} from "@/lib/api";
import { consumePendingSearch } from "@/lib/pendingSearch";
import { markAnonSearchUsed } from "@/lib/anonSearch";
import { useAuth } from "@/context";
import type { JobStatusResponse } from "@/types";

const POLL_INTERVAL = 2000;

// For demo mode when backend is not available
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK === "true";

// Pulls a clean message out of FastAPI's { "detail": "..." } error body.
function extractErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : "";
  if (!raw) return "Something went wrong. Please try again.";
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.detail) {
      return typeof parsed.detail === "string"
        ? parsed.detail
        : JSON.stringify(parsed.detail);
    }
  } catch {
    // not JSON — use the raw text
  }
  return raw;
}

// The backend rejects a second anonymous search with a "free search used" message.
function isFreeSearchExhausted(err: unknown): boolean {
  const status = err instanceof ApiError ? err.status : 0;
  const msg = extractErrorMessage(err).toLowerCase();
  return (
    (status === 402 || status === 403) &&
    (msg.includes("free search") || msg.includes("sign up"))
  );
}

export default function ProcessingPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("Initializing...");
  const [error, setError] = useState<string | null>(null);
  const [needsSignup, setNeedsSignup] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const cleanup = () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (esRef.current) esRef.current.close();
    };

    const pending = consumePendingSearch();

    if (USE_MOCK_DATA) {
      if (!pending) {
        router.replace("/");
        return cleanup;
      }
      runMockProcessing(pending);
      return cleanup;
    }

    // Real mode: consume pending search data and run the full flow
    if (!pending) {
      // If no pending data, check if we have an in-flight job from a reload.
      const matchData = sessionStorage.getItem("matchData");
      if (matchData) {
        const { jobId } = JSON.parse(matchData);
        if (jobId) {
          subscribeToJob(jobId, token ?? undefined);
          return cleanup;
        }
      }
      router.replace("/");
      return cleanup;
    }

    runFullFlow(pending);

    return cleanup;
  }, [router, token]);

  const runFullFlow = async (pending: {
    university: string;
    researchInterests: string[];
    files: File[];
    token?: string;
  }) => {
    try {
      // Auth is optional; a logged-in user gets the search saved to their account.
      const authToken = pending.token ?? token ?? undefined;

      const cv = pending.files[0];
      if (!cv) {
        setError("No resume file was provided. Please try again.");
        return;
      }

      // Submit the match job (uploads the CV inline).
      setCurrentStep("Uploading your resume...");
      setProgress(5);
      const job = await createMatch(
        pending.university,
        pending.researchInterests.join(", "),
        cv,
        authToken,
        (uploadProgress) =>
          setProgress(Math.min(5 + Math.round(uploadProgress * 0.15), 20))
      );

      // The free anonymous search has now been consumed.
      if (!authToken) {
        markAnonSearchUsed();
      }

      // Store match data so a reload can resume polling.
      sessionStorage.setItem(
        "matchData",
        JSON.stringify({
          jobId: job.job_id,
          university: pending.university,
          researchInterests: pending.researchInterests,
          resumeFileName: cv.name,
        })
      );

      setCurrentStep("Searching for matching professors...");
      subscribeToJob(job.job_id, authToken);
    } catch (err) {
      if (isFreeSearchExhausted(err)) {
        // Remember it so the home page can prompt before processing next time.
        markAnonSearchUsed();
        setNeedsSignup(true);
        return;
      }
      setError(extractErrorMessage(err));
    }
  };

  const runMockProcessing = (pending: {
    university: string;
    researchInterests: string[];
    files: File[];
  }) => {
    const steps = [
      "Creating session...",
      "Extracting information from resume...",
      "Starting professor search...",
      "Retrieving faculty listings...",
      "Analyzing professor publications...",
      "Computing research alignment...",
      "Generating recommendations...",
    ];

    let currentProgress = 0;
    let stepIndex = 0;

    pollRef.current = setInterval(() => {
      currentProgress += Math.random() * 12 + 4;

      if (currentProgress >= 100) {
        currentProgress = 100;
        if (pollRef.current) clearInterval(pollRef.current);

        sessionStorage.setItem(
          "matchData",
          JSON.stringify({
            sessionId: "mock-session",
            matchId: "mock-match",
            university: pending.university,
            researchInterests: pending.researchInterests,
            resumeFileName: pending.files[0]?.name || "resume.pdf",
          })
        );

        sessionStorage.setItem("matchResults", JSON.stringify({
          match_id: "mock-match",
          status: "completed",
          results: getMockResults(),
        }));

        setTimeout(() => router.push("/results"), 500);
      }

      setProgress(Math.min(currentProgress, 100));
      stepIndex = Math.min(
        Math.floor((currentProgress / 100) * steps.length),
        steps.length - 1
      );
      setCurrentStep(steps[stepIndex]);
    }, 800);
  };

  // Applies a job status update to the UI; returns true once the job is terminal.
  const applyJobUpdate = (job: JobStatusResponse): boolean => {
    // Offset progress to account for the upload step (~20% already done).
    const adjustedProgress = 20 + Math.round(job.progress * 0.8);
    setProgress(Math.min(adjustedProgress, 99));

    if (job.status === "done" || job.status === "completed") {
      setProgress(100);
      sessionStorage.setItem(
        "matchResults",
        JSON.stringify({
          match_id: job.job_id,
          status: "completed",
          results: job.result?.matches ?? [],
        })
      );
      router.push("/results");
      return true;
    }
    if (job.status === "failed") {
      setError(job.error || "Matching failed. Please try again.");
      return true;
    }
    return false;
  };

  // Streams job status over SSE, falling back to polling if the stream fails.
  const subscribeToJob = (jobId: string, authToken?: string) => {
    let es: EventSource;
    try {
      es = createMatchEventSource(jobId, authToken);
    } catch {
      pollMatchStatus(jobId, authToken);
      return;
    }
    esRef.current = es;

    es.onmessage = (event) => {
      try {
        const job: JobStatusResponse = JSON.parse(event.data);
        if (applyJobUpdate(job)) es.close();
      } catch {
        // ignore malformed events
      }
    };

    es.onerror = () => {
      // Transient drops auto-reconnect; a permanently closed stream falls back to polling.
      if (es.readyState === EventSource.CLOSED) {
        es.close();
        esRef.current = null;
        pollMatchStatus(jobId, authToken);
      }
    };
  };

  const pollMatchStatus = async (jobId: string, authToken?: string) => {
    let consecutiveErrors = 0;
    const MAX_RETRIES = 5;

    const poll = async () => {
      try {
        const job = await getMatch(jobId, authToken);
        consecutiveErrors = 0; // reset on success
        if (applyJobUpdate(job) && pollRef.current) {
          clearInterval(pollRef.current);
        }
      } catch {
        consecutiveErrors++;
        // Tolerate transient errors (e.g. 404 while backend is still registering the job)
        if (consecutiveErrors >= MAX_RETRIES) {
          if (pollRef.current) clearInterval(pollRef.current);
          setError("Lost connection to the server. Please try again.");
        }
      }
    };

    // Delay the first poll to give the backend time to register the job
    await new Promise((r) => setTimeout(r, 2000));
    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL);
  };

  if (needsSignup) {
    return (
      <PageLayout>
        <Container className="flex min-h-[60vh] flex-col items-center justify-center py-12">
          <div className="w-full max-w-md text-center">
            <h1 className="mb-4 text-2xl font-semibold text-text-primary">
              You&apos;ve used your free search
            </h1>
            <p className="mb-6 text-text-secondary">
              Sign up for a free account to get 3 search credits. They replenish
              at 1 every 3 days.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/register">
                <Button size="lg">Sign Up Free</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <Container className="flex min-h-[60vh] flex-col items-center justify-center py-12">
          <div className="w-full max-w-md text-center">
            <h1 className="mb-4 text-2xl font-semibold text-error">
              Something went wrong
            </h1>
            <p className="mb-6 text-text-secondary">{error}</p>
            <Button variant="outline" onClick={() => router.push("/")}>
              Try again
            </Button>
          </div>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container className="flex min-h-[60vh] flex-col items-center justify-center py-12">
        <div className="w-full max-w-md text-center">
          <h1 className="mb-2 text-2xl font-semibold text-text-primary">
            Finding your matches...
          </h1>
          <p className="mb-8 text-text-secondary">
            This may take a few moments
          </p>

          <ProgressBar value={progress} className="mb-6" />

          <p className="text-sm text-text-secondary">{currentStep}</p>
        </div>
      </Container>
    </PageLayout>
  );
}

function getMockResults() {
  return [
    {
      professor: {
        id: "1",
        name: "Dr. Sarah Chen",
        title: "Associate Professor",
        department: "Computer Science",
        university: "MIT",
        email: "schen@mit.edu",
        research_areas: ["Machine Learning", "Computer Vision", "Deep Learning"],
        publications: [
          {
            title: "Transformer Architectures for Medical Image Analysis",
            authors: ["S. Chen", "J. Smith", "A. Johnson"],
            year: 2024,
            venue: "NeurIPS",
            citation_count: 45,
            url: "https://example.com/paper/transformer-medical-imaging",
          },
          {
            title: "Self-Supervised Learning for Radiology",
            authors: ["S. Chen", "M. Williams"],
            year: 2023,
            venue: "CVPR",
            citation_count: 128,
            url: "https://example.com/paper/self-supervised-radiology",
          },
        ],
        citation_metrics: {
          h_index: 32,
          total_citations: 4520,
        },
        last_updated: "2024-01-15",
      },
      match_score: 92,
      alignment_reasons: [
        "Strong overlap in machine learning and computer vision research",
        "Recent publications align with your interest in medical imaging",
        "Active research in transformer architectures",
      ],
      relevant_publications: [
        {
          title: "Transformer Architectures for Medical Image Analysis",
          authors: ["S. Chen", "J. Smith", "A. Johnson"],
          year: 2024,
          venue: "NeurIPS",
          citation_count: 45,
          url: "https://example.com/paper/transformer-medical-imaging",
        },
      ],
      shared_keywords: ["machine learning", "computer vision", "transformers"],
      recommendation_text:
        "Dr. Chen's research in transformer architectures for medical imaging strongly aligns with your stated interests. Her recent NeurIPS publication demonstrates cutting-edge work in this area.",
    },
    {
      professor: {
        id: "2",
        name: "Dr. Michael Roberts",
        title: "Professor",
        department: "Electrical Engineering & Computer Science",
        university: "MIT",
        email: "mroberts@mit.edu",
        research_areas: ["Natural Language Processing", "Machine Learning", "AI Safety"],
        publications: [
          {
            title: "Large Language Models for Scientific Discovery",
            authors: ["M. Roberts", "L. Zhang"],
            year: 2024,
            venue: "ICML",
            citation_count: 89,
            url: "https://example.com/paper/llm-scientific-discovery",
          },
        ],
        citation_metrics: {
          h_index: 48,
          total_citations: 12340,
        },
        last_updated: "2024-01-10",
      },
      match_score: 85,
      alignment_reasons: [
        "Expertise in NLP aligns with your research interests",
        "Leading researcher in machine learning applications",
      ],
      relevant_publications: [
        {
          title: "Large Language Models for Scientific Discovery",
          authors: ["M. Roberts", "L. Zhang"],
          year: 2024,
          venue: "ICML",
          citation_count: 89,
          url: "https://example.com/paper/llm-scientific-discovery",
        },
      ],
      shared_keywords: ["NLP", "machine learning"],
      recommendation_text:
        "Dr. Roberts is a leading figure in NLP research with significant impact in the field. His work on LLMs for scientific discovery could provide excellent mentorship opportunities.",
    },
    {
      professor: {
        id: "3",
        name: "Dr. Emily Watson",
        title: "Assistant Professor",
        department: "Computer Science",
        university: "MIT",
        research_areas: ["Reinforcement Learning", "Robotics", "Machine Learning"],
        publications: [],
        citation_metrics: {
          h_index: 18,
          total_citations: 1890,
        },
        last_updated: "2024-01-12",
      },
      match_score: 78,
      alignment_reasons: [
        "Research in reinforcement learning connects to your ML interests",
        "Active and accessible junior faculty member",
      ],
      relevant_publications: [],
      shared_keywords: ["machine learning", "reinforcement learning"],
      recommendation_text:
        "Dr. Watson's work in reinforcement learning and robotics offers a unique angle on machine learning research. As an assistant professor, she may have more capacity for hands-on mentorship.",
    },
  ];
}
