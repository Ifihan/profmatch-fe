"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout, Container } from "@/components/layout";
import { Button, Input, Modal, Skeleton } from "@/components/ui";
import { useAuth } from "@/context";
import { useCredits } from "@/hooks";
import { clearSearches, deleteAccount, ApiError } from "@/lib/api";

// Pulls a clean message out of FastAPI's { "detail": "..." } error body.
function errorDetail(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    try {
      const parsed = JSON.parse(err.message);
      if (parsed?.detail && typeof parsed.detail === "string") return parsed.detail;
    } catch {
      /* not JSON */
    }
  }
  return fallback;
}

export default function SettingsPage() {
  const router = useRouter();
  const {
    user,
    token,
    isAuthenticated,
    isLoading: authLoading,
    updateName,
    logout,
  } = useAuth();
  const { balance } = useCredits();

  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [showClear, setShowClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearedMsg, setClearedMsg] = useState<string | null>(null);

  const [showDelete, setShowDelete] = useState(false);
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/login");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  if (authLoading) {
    return (
      <PageLayout>
        <Container className="py-12">
          <Skeleton className="mb-8 h-8 w-40" />
          <div className="space-y-6">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </Container>
      </PageLayout>
    );
  }

  if (!isAuthenticated || !user) return null;

  const initial = user.name?.trim().charAt(0).toUpperCase() || "?";
  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const credits = balance ?? user.credit_balance ?? 0;
  const nameChanged = name.trim().length > 0 && name.trim() !== user.name;

  const handleSaveName = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === user.name) return;
    setSavingName(true);
    setNameMsg(null);
    try {
      await updateName(trimmed);
      setNameMsg({ ok: true, text: "Name updated." });
    } catch (err) {
      setNameMsg({ ok: false, text: errorDetail(err, "Couldn't update your name.") });
    } finally {
      setSavingName(false);
    }
  };

  const handleClear = async () => {
    if (!token) return;
    setClearing(true);
    try {
      await clearSearches(token);
      setShowClear(false);
      setClearedMsg("Your search history has been cleared.");
    } catch {
      setShowClear(false);
      setClearedMsg("Couldn't clear your history. Please try again.");
    } finally {
      setClearing(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !password) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount(token, password);
      logout();
      router.replace("/");
    } catch (err) {
      setDeleteError(errorDetail(err, "Incorrect password or the account couldn't be deleted."));
      setDeleting(false);
    }
  };

  return (
    <PageLayout>
      <Container className="py-12">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-8 text-2xl font-semibold text-text-primary md:text-3xl">
            Account Settings
          </h1>

          {/* Profile */}
          <section className="mb-6 rounded-lg border border-border bg-background p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-semibold text-white">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-text-primary">
                  {user.name}
                </p>
                <p className="truncate text-sm text-text-secondary">{user.email}</p>
              </div>
            </div>

            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Display name
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex-1">
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameMsg(null);
                  }}
                  maxLength={120}
                  disabled={savingName}
                />
              </div>
              <Button
                onClick={handleSaveName}
                isLoading={savingName}
                disabled={!nameChanged}
              >
                Save
              </Button>
            </div>
            {nameMsg && (
              <p
                className={`mt-2 text-sm ${nameMsg.ok ? "text-success" : "text-error"}`}
              >
                {nameMsg.text}
              </p>
            )}
          </section>

          {/* Account details */}
          <section className="mb-6 rounded-lg border border-border bg-background p-6">
            <h2 className="mb-4 text-sm font-medium tracking-wide text-text-muted">
              Account
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="mb-1 text-xs text-text-muted">Email</p>
                <p className="truncate text-sm text-text-primary">{user.email}</p>
              </div>
              <div>
                <p className="mb-1 text-xs text-text-muted">Member since</p>
                <p className="text-sm text-text-primary">{memberSince}</p>
              </div>
              <div>
                <p className="mb-1 text-xs text-text-muted">Search credits</p>
                <p className="text-sm text-text-primary">{credits}</p>
              </div>
            </div>
            <div className="mt-6 border-t border-border pt-4">
              <Button variant="outline" size="sm" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </section>

          {/* Danger zone */}
          <section className="rounded-lg border border-error/30 bg-error/5 p-6">
            <h2 className="mb-4 text-sm font-medium tracking-wide text-error">
              Danger Zone
            </h2>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Clear search history
                </p>
                <p className="text-sm text-text-secondary">
                  Removes all of your saved searches. This can&apos;t be undone.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 text-error hover:bg-error/5"
                onClick={() => setShowClear(true)}
              >
                Clear history
              </Button>
            </div>
            {clearedMsg && (
              <p className="mt-2 text-sm text-text-secondary">{clearedMsg}</p>
            )}

            <div className="mt-6 flex flex-col gap-4 border-t border-error/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">Delete account</p>
                <p className="text-sm text-text-secondary">
                  Permanently deletes your account and all data.
                </p>
              </div>
              <Button
                size="sm"
                className="shrink-0 bg-error text-white hover:bg-error/90"
                onClick={() => {
                  setPassword("");
                  setDeleteError(null);
                  setShowDelete(true);
                }}
              >
                Delete account
              </Button>
            </div>
          </section>
        </div>
      </Container>

      {/* Clear history confirmation */}
      <Modal
        isOpen={showClear}
        onClose={() => !clearing && setShowClear(false)}
        title="Clear search history?"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            This permanently removes all of your saved searches. Your account and
            credits are unaffected.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClear(false)}
              disabled={clearing}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-error text-white hover:bg-error/90"
              onClick={handleClear}
              isLoading={clearing}
            >
              Clear history
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete account confirmation */}
      <Modal
        isOpen={showDelete}
        onClose={() => !deleting && setShowDelete(false)}
        title="Delete your account?"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            This permanently deletes your account, searches, and credits. Enter your
            password to confirm.
          </p>
          <Input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setDeleteError(null);
            }}
            disabled={deleting}
          />
          {deleteError && <p className="text-sm text-error">{deleteError}</p>}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDelete(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-error text-white hover:bg-error/90"
              onClick={handleDelete}
              isLoading={deleting}
              disabled={!password}
            >
              Delete account
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}
