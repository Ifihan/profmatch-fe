"use client";

import { useState } from "react";
import { Modal, Button } from "@/components/ui";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  codeName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteConfirmModal({
  isOpen,
  codeName,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // error handled by parent
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Promo Code">
      <p className="mb-6 text-sm text-text-secondary">
        Are you sure you want to delete the promo code{" "}
        <span className="font-mono font-semibold text-text-primary">{codeName}</span>?
        This action cannot be undone.
      </p>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          isLoading={isDeleting}
          className="bg-error hover:bg-error/90"
        >
          Delete
        </Button>
      </div>
    </Modal>
  );
}
