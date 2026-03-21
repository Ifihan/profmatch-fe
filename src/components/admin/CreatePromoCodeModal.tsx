"use client";

import { useState } from "react";
import { Modal, Input, Button } from "@/components/ui";
import type { CreatePromoCodePayload } from "@/types";

interface CreatePromoCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (payload: CreatePromoCodePayload) => Promise<void>;
}

export function CreatePromoCodeModal({
  isOpen,
  onClose,
  onCreated,
}: CreatePromoCodeModalProps) {
  const [code, setCode] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setCode("");
    setCreditAmount("");
    setMaxRedemptions("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedCode = code.trim();
    const credits = parseInt(creditAmount, 10);
    const maxUses = parseInt(maxRedemptions, 10);

    if (!trimmedCode) {
      setError("Code name is required.");
      return;
    }
    if (!credits || credits < 1) {
      setError("Credit amount must be at least 1.");
      return;
    }
    if (!maxUses || maxUses < 1) {
      setError("Max redemptions must be at least 1.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreated({
        code: trimmedCode.toUpperCase(),
        credits,
        max_uses: maxUses,
      });
      resetForm();
      onClose();
    } catch {
      setError("Failed to create promo code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Promo Code">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Code Name"
          placeholder="e.g. WELCOME10"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
        <Input
          label="Credit Amount"
          type="number"
          min={1}
          placeholder="e.g. 10"
          value={creditAmount}
          onChange={(e) => setCreditAmount(e.target.value)}
        />
        <Input
          label="Max Redemptions"
          type="number"
          min={1}
          placeholder="e.g. 100"
          value={maxRedemptions}
          onChange={(e) => setMaxRedemptions(e.target.value)}
        />

        {error && (
          <p className="text-sm text-error" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}
