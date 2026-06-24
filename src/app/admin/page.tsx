"use client";

import { useEffect, useState, useCallback } from "react";
import { PageLayout, Container } from "@/components/layout";
import { Button, Skeleton } from "@/components/ui";
import {
  AdminStatsGrid,
  PromoCodeTable,
  CreatePromoCodeModal,
  DeleteConfirmModal,
} from "@/components/admin";
import { useAuth } from "@/context";
import { useAdminGuard } from "@/hooks";
import {
  getAdminStats,
  getAdminPromoCodes,
  createPromoCode as apiCreatePromoCode,
  togglePromoCode as apiTogglePromoCode,
  deletePromoCode as apiDeletePromoCode,
} from "@/lib/api";
import type { AdminStats, PromoCode, CreatePromoCodePayload } from "@/types";

export default function AdminPage() {
  const { token } = useAuth();
  const { isReady } = useAdminGuard();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isCodesLoading, setIsCodesLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PromoCode | null>(null);

  const loadData = useCallback(async () => {
    if (!token) return;

    setIsStatsLoading(true);
    setIsCodesLoading(true);

    try {
      const [statsData, codesData] = await Promise.all([
        getAdminStats(token),
        getAdminPromoCodes(token),
      ]);
      setStats(statsData);
      setCodes(codesData);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setIsStatsLoading(false);
      setIsCodesLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isReady) {
      loadData();
    }
  }, [isReady, loadData]);

  const handleCreate = async (payload: CreatePromoCodePayload) => {
    if (!token) return;
    const created = await apiCreatePromoCode(token, payload);
    // The API returns only { id, code }; rebuild the full row for display.
    const newCode: PromoCode = {
      id: created.id,
      code: created.code ?? payload.code,
      credits: payload.credits,
      max_redemptions: payload.max_redemptions ?? null,
      times_redeemed: 0,
      is_disabled: false,
    };
    setCodes((prev) => [newCode, ...prev]);
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    if (!token) return;
    // Optimistic update (isActive is the desired state; is_disabled is its inverse)
    setCodes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_disabled: !isActive } : c))
    );
    try {
      await apiTogglePromoCode(token, id, isActive);
    } catch {
      // Revert on error
      setCodes((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_disabled: isActive } : c))
      );
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;
    const idToDelete = deleteTarget.id;
    try {
      await apiDeletePromoCode(token, idToDelete);
      setCodes((prev) => prev.filter((c) => c.id !== idToDelete));
    } catch (err) {
      console.error("Failed to delete promo code:", err);
    }
  };

  if (!isReady) {
    return (
      <PageLayout>
        <Container className="py-12">
          <div className="mb-8">
            <Skeleton className="mb-2 h-8 w-48" />
            <Skeleton className="h-5 w-64" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container className="py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-semibold text-text-primary md:text-3xl">
            Admin Dashboard
          </h1>
          <p className="text-text-secondary">
            Platform overview and promo code management
          </p>
        </div>

        {/* Stats */}
        <AdminStatsGrid stats={stats} isLoading={isStatsLoading} />

        {/* Promo Codes */}
        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary">
              Promo Codes
            </h2>
            <Button onClick={() => setShowCreateModal(true)}>
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Code
            </Button>
          </div>

          <PromoCodeTable
            codes={codes}
            onToggle={handleToggle}
            onDelete={(id) => {
              const code = codes.find((c) => c.id === id);
              if (code) setDeleteTarget(code);
            }}
            onCreate={() => setShowCreateModal(true)}
            isLoading={isCodesLoading}
          />
        </section>

        {/* Modals */}
        <CreatePromoCodeModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreate}
        />

        <DeleteConfirmModal
          isOpen={!!deleteTarget}
          codeName={deleteTarget?.code ?? ""}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      </Container>
    </PageLayout>
  );
}
