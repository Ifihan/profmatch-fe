"use client";

import Link from "next/link";
import { useAuth } from "@/context";
import { useCredits } from "@/hooks";
import { Button } from "@/components/ui";

export function Header() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { balance } = useCredits();

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-semibold text-primary">ProfMatch</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-text-secondary transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="text-sm text-text-secondary transition-colors hover:text-primary"
          >
            About
          </Link>

          {isLoading ? (
            <div className="h-5 w-20 animate-pulse rounded bg-surface" />
          ) : isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-text-secondary transition-colors hover:text-primary"
                data-tour="dashboard-link"
              >
                Dashboard
              </Link>
              <Link
                href="/plans"
                className="inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-primary"
                title="Search credits remaining"
                data-tour="credits-icon"
              >
                <svg
                  className="h-4 w-4 text-primary"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.69l1.34 2.07C15.15 7.47 18 11.69 18 14.5A6 6 0 0 1 6 14.5c0-2.81 2.85-7.03 4.66-9.74L12 2.69M12 0C12 0 4 9.2 4 14.5a8 8 0 0 0 16 0C20 9.2 12 0 12 0z" />
                </svg>
                <span className="font-medium text-text-primary">
                  {balance !== null ? balance : "..."}
                </span>
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>
                Sign Out
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" data-tour="signup-button">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
