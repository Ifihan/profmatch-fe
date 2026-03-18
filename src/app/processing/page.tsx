"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { PageLayout, Container } from "@/components/layout";
import { ProgressBar, Button } from "@/components/ui";
import {
  createSession,
  uploadFile,
  startMatch,
  getMatchStatus,
  getMatchResults,
} from "@/lib/api";
import { consumePendingSearch } from "@/lib/pendingSearch";

const POLL_INTERVAL = 2000;

// For demo mode when backend is not available
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export default function ProcessingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("Initializing...");
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const pending = consumePendingSearch();

    if (USE_MOCK_DATA) {
      if (!pending) {
        router.replace("/");
        return;
      }
      runMockProcessing(pending);
      return;
    }

    // Real mode: consume pending search data and run the full flow
    if (!pending) {
      // If no pending data, check if we have matchData from a previous session
      const matchData = sessionStorage.getItem("matchData");
      if (matchData) {
        const { matchId, sessionId } = JSON.parse(matchData);
        pollMatchStatus(matchId, sessionId);
      } else {
        router.replace("/");
      }
      return;
    }

    runFullFlow(pending);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [router]);

  const runFullFlow = async (pending: {
    university: string;
    researchInterests: string[];
    files: File[];
    token?: string;
  }) => {
    try {
      // Step 1: Create session
      setCurrentStep("Creating session...");
      setProgress(5);
      const session = await createSession(pending.token);

      // Step 2: Upload resume
      setCurrentStep("Extracting information from resume...");
      setProgress(15);
      const fileIds: string[] = [];
      for (const file of pending.files) {
        const response = await uploadFile(session.session_id, file);
        fileIds.push(response.file_id);
      }

      // Step 3: Start matching
      setCurrentStep("Starting professor search...");
      setProgress(25);
      const { match_id: matchId } = await startMatch(
        session.session_id,
        pending.university,
        pending.researchInterests,
        fileIds,
        pending.token
      );

      // Store match data for the results page
      sessionStorage.setItem(
        "matchData",
        JSON.stringify({
          sessionId: session.session_id,
          matchId,
          university: pending.university,
          researchInterests: pending.researchInterests,
          resumeFileName: pending.files[0]?.name || "resume.pdf",
        })
      );

      // Step 4: Poll for results
      pollMatchStatus(matchId, session.session_id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
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

  const pollMatchStatus = async (matchId: string, sessionId: string) => {
    const poll = async () => {
      try {
        const status = await getMatchStatus(matchId, sessionId);

        // Offset progress to account for the setup steps (25% already done)
        const adjustedProgress = 25 + Math.round(status.progress * 0.75);
        setProgress(adjustedProgress);
        setCurrentStep(status.current_step);

        if (status.status === "completed") {
          if (pollRef.current) clearInterval(pollRef.current);

          const results = await getMatchResults(matchId, sessionId);
          sessionStorage.setItem("matchResults", JSON.stringify(results));

          router.push("/results");
        } else if (status.status === "failed") {
          if (pollRef.current) clearInterval(pollRef.current);
          setError(status.error || "Matching failed. Please try again.");
        }
      } catch (err) {
        if (pollRef.current) clearInterval(pollRef.current);
        setError(
          err instanceof Error ? err.message : "Failed to get status. Please try again."
        );
      }
    };

    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL);
  };

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
