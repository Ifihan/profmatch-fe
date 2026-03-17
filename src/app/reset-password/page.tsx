"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageLayout, Container } from "@/components/layout";
import { Input, Button } from "@/components/ui";
import { resetPassword } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!token) {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <h1 className="mb-4 text-2xl font-semibold text-text-primary">
          Invalid Reset Link
        </h1>
        <p className="mb-6 text-text-secondary">
          This password reset link is invalid or has expired.
        </p>
        <Link href="/forgot-password">
          <Button>Request New Reset Link</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token, password);
      setIsSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to reset password. The link may have expired."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mb-6 rounded-md bg-success/10 p-4 text-sm text-success">
          Your password has been reset successfully. Redirecting to sign in...
        </div>
        <Link
          href="/login"
          className="text-sm font-medium text-primary hover:text-primary-light"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-semibold text-text-primary md:text-3xl">
          Set New Password
        </h1>
        <p className="text-text-secondary">
          Enter your new password below
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-md bg-error/10 p-4 text-sm text-error">
            {error}
          </div>
        )}

        <Input
          label="New Password"
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          Reset Password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <PageLayout>
      <Container className="py-12 md:py-20">
        <Suspense
          fallback={
            <div className="flex min-h-[40vh] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </Container>
    </PageLayout>
  );
}
