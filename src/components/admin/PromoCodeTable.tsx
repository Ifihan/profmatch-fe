"use client";

import { useState } from "react";
import { Button, Skeleton } from "@/components/ui";
import type { PromoCode } from "@/types";

interface PromoCodeTableProps {
  codes: PromoCode[];
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  isLoading: boolean;
}

export function PromoCodeTable({
  codes,
  onToggle,
  onDelete,
  onCreate,
  isLoading,
}: PromoCodeTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (code: PromoCode) => {
    try {
      await navigator.clipboard.writeText(code.code);
      setCopiedId(code.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — silently no-op.
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  if (codes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
        <svg
          className="mb-4 h-12 w-12 text-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M6 6h.008v.008H6V6z"
          />
        </svg>
        <h3 className="mb-2 text-lg font-semibold text-text-primary">
          No promo codes yet
        </h3>
        <p className="mb-6 text-center text-text-secondary">
          Create your first promo code to start distributing credits
        </p>
        <Button onClick={onCreate}>Create Code</Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {codes.map((code) => {
        const cap = code.max_redemptions; // null = unlimited
        const used = code.times_redeemed;
        const isActive = !code.is_disabled;
        const isFull = cap != null && used >= cap;
        const usagePercent = cap ? Math.round((used / cap) * 100) : 0;

        return (
          <div
            key={code.id}
            className="flex flex-col gap-4 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-semibold text-text-primary">
                  {code.code}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(code)}
                  className="text-text-muted transition-colors hover:text-primary"
                  aria-label={`Copy promo code ${code.code}`}
                  title={copiedId === code.id ? "Copied!" : "Copy code"}
                >
                  {copiedId === code.id ? (
                    <svg
                      className="h-4 w-4 text-success"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
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
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    isActive && !isFull
                      ? "bg-success/10 text-success"
                      : "bg-error/10 text-error"
                  }`}
                >
                  {code.is_disabled
                    ? "Disabled"
                    : isFull
                      ? "Fully Redeemed"
                      : "Active"}
                </span>
              </div>
              <p className="text-sm text-text-secondary">
                {code.credits} credits &middot; {used}
                {cap != null ? ` / ${cap}` : ""} used
                {cap != null ? ` (${usagePercent}%)` : ""}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggle(code.id, code.is_disabled)}
              >
                {code.is_disabled ? "Enable" : "Disable"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(code.id)}
                className="text-error hover:bg-error/5"
              >
                Delete
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
