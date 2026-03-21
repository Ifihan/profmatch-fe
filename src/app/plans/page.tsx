"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageLayout, Container } from "@/components/layout";
import { Button, Input, Skeleton } from "@/components/ui";
import { useAuth } from "@/context";
import { useCredits } from "@/hooks";
import { getCreditPlans, redeemPromoCode } from "@/lib/api";
import type { CreditPlan } from "@/types";

export default function PlansPage() {
  const { token, isAuthenticated } = useAuth();
  const { balance, nextFreeCredit, refresh: refreshCredits } = useCredits();
  const [plans, setPlans] = useState<CreditPlan[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  useEffect(() => {
    getCreditPlans()
      .then((data) => {
        setPlans(data.plans);
        setMessage(data.message);
      })
      .catch(() => {
        setPlans([
          { id: "starter", name: "Starter", credits: 15, price_usd: 5.0, available: false },
          { id: "explorer", name: "Explorer", credits: 40, price_usd: 12.0, available: false },
          { id: "researcher", name: "Researcher", credits: 100, price_usd: 25.0, available: false },
        ]);
        setMessage("Credit purchases coming soon!");
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <PageLayout>
      <Container className="py-12 md:py-20">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-3 text-3xl font-semibold text-text-primary md:text-4xl">
              Search Credits
            </h1>
            <p className="text-lg text-text-secondary">
              Each search uses one credit to find your best professor matches
            </p>
          </div>

          {/* Current balance — inline with how-it-works style */}
          {isAuthenticated && balance !== null && (
            <div className="mb-12 flex items-center justify-center gap-6">
              <div className="flex items-center gap-3">
                <svg
                  className="h-10 w-10 text-primary"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.69l1.34 2.07C15.15 7.47 18 11.69 18 14.5A6 6 0 0 1 6 14.5c0-2.81 2.85-7.03 4.66-9.74L12 2.69M12 0C12 0 4 9.2 4 14.5a8 8 0 0 0 16 0C20 9.2 12 0 12 0z" />
                </svg>
                <div>
                  <p className="text-3xl font-bold text-text-primary">
                    {balance}
                    <span className="ml-2 text-base font-normal text-text-secondary">
                      credit{balance !== 1 ? "s" : ""} remaining
                    </span>
                  </p>
                  {balance === 0 && nextFreeCredit && (
                    <p className="text-sm text-text-muted">
                      Next free credit:{" "}
                      {new Date(nextFreeCredit).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* How credits work */}
          <section className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-text-primary">
              How Credits Work
            </h2>
            <div className="space-y-4 text-text-secondary">
              <div className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  1
                </span>
                <p>
                  Every account starts with{" "}
                  <span className="font-medium text-text-primary">3 free search credits</span>.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  2
                </span>
                <p>
                  Each search consumes{" "}
                  <span className="font-medium text-text-primary">1 credit</span> when you click
                  &quot;Find Matches&quot;.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  3
                </span>
                <p>
                  You earn{" "}
                  <span className="font-medium text-text-primary">1 free credit every 3 days</span>.
                  Free credits cap at 3 — spend one to start earning again.
                </p>
              </div>
            </div>
            {!isAuthenticated && (
              <div className="mt-6">
                <Link href="/register">
                  <Button>Sign Up for Free Credits</Button>
                </Link>
              </div>
            )}
          </section>

          {/* Promo Code Redemption */}
          {isAuthenticated && (
            <section className="mb-12">
              <h2 className="mb-4 text-xl font-semibold text-text-primary">
                Have a Promo Code?
              </h2>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value.toUpperCase());
                      setPromoSuccess(null);
                      setPromoError(null);
                    }}
                  />
                </div>
                <Button
                  onClick={async () => {
                    if (!token || !promoCode.trim()) return;
                    setPromoLoading(true);
                    setPromoSuccess(null);
                    setPromoError(null);
                    try {
                      const result = await redeemPromoCode(token, promoCode.trim());
                      setPromoSuccess(
                        `${result.credits_granted} credits added! New balance: ${result.new_balance}`
                      );
                      setPromoCode("");
                      refreshCredits();
                    } catch (err) {
                      setPromoError(
                        err instanceof Error
                          ? err.message
                          : "Invalid or expired promo code."
                      );
                    } finally {
                      setPromoLoading(false);
                    }
                  }}
                  isLoading={promoLoading}
                  disabled={!promoCode.trim()}
                >
                  Redeem
                </Button>
              </div>
              {promoSuccess && (
                <p className="mt-2 text-sm text-success">{promoSuccess}</p>
              )}
              {promoError && (
                <p className="mt-2 text-sm text-error">{promoError}</p>
              )}
            </section>
          )}

          {/* Divider */}
          <hr className="mb-12 border-border" />

          {/* Plans */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-text-primary">
              Need More Credits?
            </h2>
            <p className="mb-6 text-text-secondary">
              Credit packs will be available for purchase soon.
            </p>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-primary">
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2.69l1.34 2.07C15.15 7.47 18 11.69 18 14.5A6 6 0 0 1 6 14.5c0-2.81 2.85-7.03 4.66-9.74L12 2.69M12 0C12 0 4 9.2 4 14.5a8 8 0 0 0 16 0C20 9.2 12 0 12 0z" />
                        </svg>
                        <span className="text-lg font-semibold">{plan.credits}</span>
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{plan.name}</p>
                        <p className="text-xs text-text-muted">
                          ${(plan.price_usd / plan.credits).toFixed(2)} per search
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-semibold text-text-primary">
                        ${plan.price_usd}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!plan.available}
                      >
                        {plan.available ? "Purchase" : "Coming Soon"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {message && (
              <p className="mt-4 text-sm text-text-muted">{message}</p>
            )}
          </section>
        </div>
      </Container>
    </PageLayout>
  );
}
