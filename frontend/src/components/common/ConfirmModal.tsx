import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  open: boolean;
}

export default function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  open,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close confirmation modal"
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-200"
        onClick={onCancel}
        disabled={loading}
      />

      <div className="relative w-full max-w-md animate-[fade-in_180ms_ease-out] rounded-2xl border border-line bg-surface p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-status-pending-bg text-status-pending-text">
            <AlertTriangle size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink-muted">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button type="button" variant="danger" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
