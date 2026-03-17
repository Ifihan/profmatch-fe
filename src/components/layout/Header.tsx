"use client";

import Link from "next/link";
import { useAuth } from "@/context";
import { Button } from "@/components/ui";

export function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

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
              >
                Dashboard
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
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
