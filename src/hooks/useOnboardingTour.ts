"use client";

import { useState, useEffect, useCallback } from "react";

export interface TourStep {
  id: string;
  title: string;
  content: string;
  targetSelector: string;
  placement: "top" | "bottom" | "left" | "right";
}

interface UseOnboardingTourOptions {
  tourId: string;
  steps: TourStep[];
  enabled: boolean;
  delay?: number;
}

export function useOnboardingTour({
  tourId,
  steps,
  enabled,
  delay = 500,
}: UseOnboardingTourOptions) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const storageKey = `profmatch_tour_${tourId}_completed`;

  // Check localStorage and activate tour after delay
  useEffect(() => {
    if (!enabled) return;

    // SSR guard
    if (typeof window === "undefined") return;

    const completed = localStorage.getItem(storageKey);
    if (completed === "true") return;

    const timer = setTimeout(() => {
      setIsActive(true);
      setStepIndex(0);
    }, delay);

    return () => clearTimeout(timer);
  }, [enabled, storageKey, delay]);

  const dismiss = useCallback(() => {
    setIsActive(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, "true");
    }
  }, [storageKey]);

  const next = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      dismiss();
    }
  }, [stepIndex, steps.length, dismiss]);

  const prev = useCallback(() => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  }, [stepIndex]);

  const currentStep = isActive ? steps[stepIndex] ?? null : null;

  return {
    currentStep,
    stepIndex,
    totalSteps: steps.length,
    isActive,
    next,
    prev,
    dismiss,
  };
}
