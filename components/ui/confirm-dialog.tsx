"use client";

import { X, AlertTriangle } from "lucide-react";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Conferma",
  cancelText = "Annulla",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  const variantStyles = {
    danger: {
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      button: "bg-red-600 hover:bg-red-500 disabled:bg-red-400",
    },
    warning: {
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      button: "bg-orange-600 hover:bg-orange-500 disabled:bg-orange-400",
    },
    info: {
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400",
    },
  };

  const styles = variantStyles[variant];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          aria-describedby="dialog-description"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Chiudi"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>

          {/* Icon */}
          <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${styles.iconBg}`}>
            <AlertTriangle className={`h-6 w-6 ${styles.iconColor}`} />
          </div>

          {/* Title */}
          <h3
            id="dialog-title"
            className="mt-4 text-center text-lg font-semibold text-gray-900"
          >
            {title}
          </h3>

          {/* Message */}
          <p
            id="dialog-description"
            className="mt-2 text-center text-sm text-gray-600"
          >
            {message}
          </p>

          {/* Actions */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors ${styles.button}`}
            >
              {loading ? "Caricamento..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
