"use client";

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
        const isFull = code.use_count >= code.max_uses;
        const usagePercent = Math.round(
          (code.use_count / code.max_uses) * 100
        );

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
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    code.is_active && !isFull
                      ? "bg-success/10 text-success"
                      : "bg-error/10 text-error"
                  }`}
                >
                  {!code.is_active ? "Disabled" : isFull ? "Fully Redeemed" : "Active"}
                </span>
              </div>
              <p className="text-sm text-text-secondary">
                {code.credits} credits &middot;{" "}
                {code.use_count}/{code.max_uses} used ({usagePercent}%)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggle(code.id, !code.is_active)}
              >
                {code.is_active ? "Disable" : "Enable"}
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
