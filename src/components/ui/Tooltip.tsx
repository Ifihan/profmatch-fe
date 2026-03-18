"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type Placement = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  targetSelector: string;
  isOpen: boolean;
  onDismiss: () => void;
  placement?: Placement;
  title?: string;
  children: React.ReactNode;
  className?: string;
  stepInfo?: { current: number; total: number };
  onPrev?: () => void;
  onNext?: () => void;
}

const ARROW_SIZE = 6;
const GAP = ARROW_SIZE + 8;

function getPosition(
  targetRect: DOMRect,
  tooltipRect: DOMRect,
  placement: Placement
) {
  let top = 0;
  let left = 0;

  switch (placement) {
    case "bottom":
      top = targetRect.bottom + GAP;
      left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
      break;
    case "top":
      top = targetRect.top - GAP - tooltipRect.height;
      left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
      break;
    case "left":
      top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      left = targetRect.left - GAP - tooltipRect.width;
      break;
    case "right":
      top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      left = targetRect.right + GAP;
      break;
  }

  // Clamp to viewport
  left = Math.max(12, Math.min(left, window.innerWidth - tooltipRect.width - 12));
  top = Math.max(12, Math.min(top, window.innerHeight - tooltipRect.height - 12));

  return { top, left };
}

function getArrowPosition(
  targetRect: DOMRect,
  tooltipPos: { top: number; left: number },
  tooltipRect: DOMRect,
  placement: Placement
): React.CSSProperties {
  const targetCenterX = targetRect.left + targetRect.width / 2;
  const targetCenterY = targetRect.top + targetRect.height / 2;

  switch (placement) {
    case "bottom":
      return {
        top: -ARROW_SIZE,
        left: Math.max(16, Math.min(targetCenterX - tooltipPos.left - ARROW_SIZE, tooltipRect.width - 32)),
      };
    case "top":
      return {
        bottom: -ARROW_SIZE,
        left: Math.max(16, Math.min(targetCenterX - tooltipPos.left - ARROW_SIZE, tooltipRect.width - 32)),
      };
    case "left":
      return {
        right: -ARROW_SIZE,
        top: Math.max(16, Math.min(targetCenterY - tooltipPos.top - ARROW_SIZE, tooltipRect.height - 32)),
      };
    case "right":
      return {
        left: -ARROW_SIZE,
        top: Math.max(16, Math.min(targetCenterY - tooltipPos.top - ARROW_SIZE, tooltipRect.height - 32)),
      };
  }
}

export function Tooltip({
  targetSelector,
  isOpen,
  onDismiss,
  placement = "bottom",
  title,
  children,
  className,
  stepInfo,
  onPrev,
  onNext,
}: TooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [targetEl, setTargetEl] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  // SSR guard
  useEffect(() => {
    setMounted(true);
  }, []);

  // Find target element
  useEffect(() => {
    if (!isOpen || !mounted) return;
    const findTarget = () => {
      const el = document.querySelector<HTMLElement>(targetSelector);
      setTargetEl(el);
    };
    findTarget();
    // Retry once after a short delay in case element isn't rendered yet
    const timer = setTimeout(findTarget, 100);
    return () => clearTimeout(timer);
  }, [targetSelector, isOpen, mounted]);

  // Calculate position
  const updatePosition = useCallback(() => {
    if (!targetEl || !tooltipRef.current) return;
    const targetRect = targetEl.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    setPosition(getPosition(targetRect, tooltipRect, placement));
  }, [targetEl, placement]);

  useEffect(() => {
    if (!isOpen || !targetEl) return;
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, targetEl, updatePosition]);

  // Recalculate after first render to get accurate tooltip dimensions
  useEffect(() => {
    if (!isOpen || !targetEl || !tooltipRef.current) return;
    requestAnimationFrame(updatePosition);
  }, [isOpen, targetEl, updatePosition]);

  // Escape key dismiss
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onDismiss();
      }
    },
    [onDismiss]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !mounted || !targetEl) return null;

  const targetRect = targetEl.getBoundingClientRect();

  const tooltip = (
    <>
      {/* Backdrop: dims + blurs the page behind */}
      <div
        className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-[2px]"
        onClick={onDismiss}
        aria-hidden="true"
      />

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        className={cn(
          "fixed z-[9999] max-w-xs rounded-lg border border-border bg-background/95 p-4 shadow-xl backdrop-blur-sm",
          className
        )}
        style={{
          top: position?.top ?? -9999,
          left: position?.left ?? -9999,
          visibility: position ? "visible" : "hidden",
        }}
        role="tooltip"
      >
        {/* Arrow */}
        {position && (
          <div
            className="absolute h-3 w-3 rotate-45 bg-background/95"
            style={getArrowPosition(targetRect, position, tooltipRef.current!.getBoundingClientRect(), placement)}
          />
        )}

        {/* Header */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
            )}
            {stepInfo && (
              <p className="text-xs text-text-muted">
                {stepInfo.current} of {stepInfo.total}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-md p-0.5 text-text-muted transition-colors hover:bg-surface hover:text-text-primary"
            aria-label="Dismiss tooltip"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="text-sm text-text-secondary">{children}</div>

        {/* Footer with Prev / Next buttons */}
        {(onPrev || onNext) && (
          <div className="mt-3 flex justify-between">
            {onPrev ? (
              <button
                type="button"
                onClick={onPrev}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface"
              >
                Previous
              </button>
            ) : (
              <span />
            )}
            {onNext && (
              <button
                type="button"
                onClick={onNext}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary/90"
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );

  return createPortal(tooltip, document.body);
}
