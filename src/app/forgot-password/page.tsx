"use client";

import { useState } from "react";
import Link from "next/link";
import { PageLayout, Container } from "@/components/layout";
import { Input, Button } from "@/components/ui";
import { forgotPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <Container className="py-12 md:py-20">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-semibold text-text-primary md:text-3xl">
              Reset Your Password
            </h1>
            <p className="text-text-secondary">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>

          {isSubmitted ? (
            <div className="space-y-6 text-center">
              <div className="rounded-md bg-success/10 p-4 text-sm text-success">
                If an account exists with that email, you&apos;ll receive a password
                reset link shortly.
              </div>
              <Link
                href="/login"
                className="inline-block text-sm font-medium text-primary hover:text-primary-light"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-md bg-error/10 p-4 text-sm text-error">
                  {error}
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                Send Reset Link
              </Button>
            </form>
          )}

          {!isSubmitted && (
            <p className="mt-6 text-center text-sm text-text-secondary">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary-light"
              >
                Sign in
              </Link>
            </p>
          )}
        </div>
      </Container>
    </PageLayout>
  );
}
