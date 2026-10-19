"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode; // extra content like a textarea
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus the cancel button when the dialog opens
  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onCancel}
      />
      {/* Panel */}
      <div className="relative bg-white rounded-[14px] shadow-xl p-6 w-full max-w-sm mx-4">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 rounded text-[#5A7370] hover:text-[#1F2D2B] hover:bg-[#F3F7F6]"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        <h2 id="confirm-title" className="text-lg font-semibold text-[#1F2D2B] mb-2">
          {title}
        </h2>
        <p className="text-[#5A7370] text-base mb-4">{message}</p>
        {children && <div className="mb-4">{children}</div>}
        <div className="flex gap-3 justify-end">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="px-4 py-2 rounded-[10px] border border-[#E2EEEC] text-[#1F2D2B] hover:bg-[#F3F7F6] font-medium text-base"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "px-4 py-2 rounded-[10px] font-medium text-base text-white",
              variant === "danger"
                ? "bg-[#D94F4F] hover:bg-[#C44040]"
                : "bg-[#2F8F83] hover:bg-[#236F65]"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
