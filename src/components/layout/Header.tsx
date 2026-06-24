"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context";
import { useCredits } from "@/hooks";
import { Button } from "@/components/ui";

export function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { balance } = useCredits();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initial = user?.name?.trim().charAt(0).toUpperCase() || "?";

  // Close the avatar menu on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

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
          <Link
            href="/plans"
            className="text-sm text-text-secondary transition-colors hover:text-primary"
          >
            Plans
          </Link>

          {isLoading ? (
            <div className="h-5 w-20 animate-pulse rounded bg-surface" />
          ) : isAuthenticated ? (
            <>
              {user?.is_admin && (
                <Link
                  href="/admin"
                  className="text-sm text-text-secondary transition-colors hover:text-primary"
                >
                  Admin
                </Link>
              )}
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
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-label="Account menu"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  title={user?.name || "Account"}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-primary bg-white text-sm font-semibold text-primary transition-colors hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {initial}
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-md border border-border bg-background py-1 shadow-lg"
                  >
                    <div className="border-b border-border px-4 py-2">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {user?.name}
                      </p>
                      <p className="truncate text-xs text-text-muted">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      href="/settings"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-primary"
                    >
                      Settings
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-error transition-colors hover:bg-error/5"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
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
