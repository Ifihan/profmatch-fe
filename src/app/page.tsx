"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageLayout, Container } from "@/components/layout";
import { Input, TextArea, Button, FileUpload, Modal, Tooltip } from "@/components/ui";
import { useAuth } from "@/context";
import { useCredits, useOnboardingTour } from "@/hooks";
import { ApiError } from "@/lib/api";
import type { TourStep } from "@/hooks/useOnboardingTour";
import type { UploadedFile } from "@/components/ui";

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK === "true";

const ANON_TOUR_STEPS: TourStep[] = [
  {
    id: "free-search",
    title: "Your Free Search",
    content:
      "You get 1 free search without an account. Enter a university, your interests, and a resume to find matching professors.",
    targetSelector: '[data-tour="find-matches-btn"]',
    placement: "bottom",
  },
  {
    id: "signup",
    title: "Want More?",
    content:
      "Sign up for a free account to get 3 search credits. They replenish at 1 every 3 days.",
    targetSelector: '[data-tour="signup-button"]',
    placement: "bottom",
  },
];

const AUTH_TOUR_STEPS: TourStep[] = [
  {
    id: "credits-icon",
    title: "Your Search Credits",
    content:
      "This shows your remaining credits. You start with 3 and earn 1 every 3 days (up to 3). Click to view plans.",
    targetSelector: '[data-tour="credits-icon"]',
    placement: "bottom",
  },
  {
    id: "dashboard",
    title: "Your Dashboard",
    content:
      "Your past searches and saved results live here. Each search is stored automatically.",
    targetSelector: '[data-tour="dashboard-link"]',
    placement: "bottom",
  },
];

export default function Home() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
  const { balance, nextFreeCredit, refresh: refreshCredits } = useCredits();
  const [isLoading, setIsLoading] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  const anonTour = useOnboardingTour({
    tourId: "home-anon",
    steps: ANON_TOUR_STEPS,
    enabled: !authLoading && !isAuthenticated,
  });

  const authTour = useOnboardingTour({
    tourId: "home-auth",
    steps: AUTH_TOUR_STEPS,
    enabled: !authLoading && isAuthenticated,
  });
  const [university, setUniversity] = useState("");
  const [researchInterests, setResearchInterests] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<{
    university?: string;
    researchInterests?: string;
    files?: string;
    submit?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!university.trim()) {
      newErrors.university = "Please enter a university URL";
    } else {
      try {
        const url = new URL(university);
        if (!url.protocol.startsWith("http")) {
          newErrors.university = "Please enter a valid URL (e.g., https://www.mit.edu)";
        }
      } catch {
        newErrors.university = "Please enter a valid URL (e.g., https://www.mit.edu)";
      }
    }

    if (!researchInterests.trim()) {
      newErrors.researchInterests = "Please describe your research interests";
    }

    if (files.length === 0) {
      newErrors.files = "Please upload your resume";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFilesChange = (newFiles: UploadedFile[]) => {
    setFiles(newFiles);
    // Clear file error when user uploads a file
    if (newFiles.length > 0 && errors.files) {
      setErrors((prev) => ({ ...prev, files: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Pre-check credits for authenticated users
    if (isAuthenticated && balance !== null && balance <= 0) {
      setShowCreditsModal(true);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const interests = researchInterests
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const resumeFileName = files[0]?.file.name || "resume.pdf";

      if (USE_MOCK_DATA) {
        // Demo mode: skip API calls, store form data and navigate
        sessionStorage.setItem(
          "matchData",
          JSON.stringify({
            sessionId: "mock-session",
            matchId: "mock-match",
            university,
            researchInterests: interests,
            resumeFileName,
          })
        );

        router.push("/processing");
      } else {
        // Real mode: make API calls
        const { createSession, uploadFile, startMatch } = await import("@/lib/api");

        const session = await createSession(token ?? undefined);

        const fileIds: string[] = [];
        for (const { file } of files) {
          const response = await uploadFile(session.session_id, file);
          fileIds.push(response.file_id);
        }

        const { match_id: matchId } = await startMatch(
          session.session_id,
          university,
          interests,
          fileIds,
          token ?? undefined
        );

        sessionStorage.setItem(
          "matchData",
          JSON.stringify({
            sessionId: session.session_id,
            matchId,
            university,
            researchInterests: interests,
            resumeFileName,
          })
        );

        router.push("/processing");
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        await refreshCredits();
        setShowCreditsModal(true);
        setIsLoading(false);
        return;
      }
      setErrors({
        submit:
          err instanceof Error ? err.message : "Something went wrong. Please try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <Container className="py-12 md:py-20">
        <div className="mx-auto max-w-xl">
          <div className="mb-10 text-center">
            <h1 className="mb-3 text-3xl font-semibold text-text-primary md:text-4xl">
              Find Your Research Supervisor
            </h1>
            <p className="text-lg text-text-secondary">
              Match with professors whose research aligns with your academic
              goals
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <div className="rounded-md bg-error/10 p-4 text-sm text-error">
                {errors.submit}
              </div>
            )}

            <Input
              label="University URL"
              placeholder="e.g., https://www.mit.edu"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              error={errors.university}
              disabled={isLoading}
            />

            <TextArea
              label="Research Interests"
              placeholder="e.g., machine learning, computer vision, natural language processing"
              value={researchInterests}
              onChange={(e) => setResearchInterests(e.target.value)}
              error={errors.researchInterests}
              disabled={isLoading}
            />

            <FileUpload
              label="Your Resume"
              value={files}
              onChange={handleFilesChange}
              error={errors.files}
              disabled={isLoading}
              multiple={false}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              data-tour="find-matches-btn"
            >
              Find Matches
            </Button>

            {!isAuthenticated && (
              <p className="text-center text-sm text-text-muted" data-tour="free-search-text">
                <svg
                  className="mr-1 inline-block h-4 w-4 align-text-bottom text-primary"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.69l1.34 2.07C15.15 7.47 18 11.69 18 14.5A6 6 0 0 1 6 14.5c0-2.81 2.85-7.03 4.66-9.74L12 2.69M12 0C12 0 4 9.2 4 14.5a8 8 0 0 0 16 0C20 9.2 12 0 12 0z" />
                </svg>
                1 free search available —{" "}
                <Link
                  href="/register"
                  className="font-medium text-primary hover:underline"
                >
                  sign up
                </Link>{" "}
                for 3 credits
              </p>
            )}
          </form>
        </div>
      </Container>

      <Modal
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
        title="Insufficient Credits"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            You don&apos;t have enough search credits to start a new search.
            {isAuthenticated
              ? " Free credits replenish at 1 every 3 days (up to 3)."
              : " Sign up for a free account to get 3 search credits."}
          </p>
          {nextFreeCredit && (
            <div className="rounded-md bg-surface p-3 text-center">
              <p className="text-xs text-text-muted">Next free credit</p>
              <p className="text-sm font-medium text-text-primary">
                {new Date(nextFreeCredit).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
          <div className="flex gap-2">
            {isAuthenticated ? (
              <Link href="/plans" className="flex-1">
                <Button className="w-full" size="sm">
                  Get More Credits
                </Button>
              </Link>
            ) : (
              <Link href="/register" className="flex-1">
                <Button className="w-full" size="sm">
                  Sign Up Free
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreditsModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Onboarding tooltips */}
      {anonTour.currentStep && (
        <Tooltip
          targetSelector={anonTour.currentStep.targetSelector}
          isOpen={anonTour.isActive}
          onDismiss={anonTour.dismiss}
          placement={anonTour.currentStep.placement}
          title={anonTour.currentStep.title}
          stepInfo={{
            current: anonTour.stepIndex + 1,
            total: anonTour.totalSteps,
          }}
          onPrev={anonTour.stepIndex > 0 ? anonTour.prev : undefined}
          onNext={
            anonTour.stepIndex < anonTour.totalSteps - 1
              ? anonTour.next
              : undefined
          }
        >
          {anonTour.currentStep.content}
        </Tooltip>
      )}

      {authTour.currentStep && (
        <Tooltip
          targetSelector={authTour.currentStep.targetSelector}
          isOpen={authTour.isActive}
          onDismiss={authTour.dismiss}
          placement={authTour.currentStep.placement}
          title={authTour.currentStep.title}
          stepInfo={{
            current: authTour.stepIndex + 1,
            total: authTour.totalSteps,
          }}
          onPrev={authTour.stepIndex > 0 ? authTour.prev : undefined}
          onNext={
            authTour.stepIndex < authTour.totalSteps - 1
              ? authTour.next
              : undefined
          }
        >
          {authTour.currentStep.content}
        </Tooltip>
      )}
    </PageLayout>
  );
}
