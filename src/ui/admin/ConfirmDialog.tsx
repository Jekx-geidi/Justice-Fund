'use client';

import { useEffect, useRef } from 'react';

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="confirm-dialog" onCancel={onCancel}>
      <div className="p-6">
        <h2 className="text-lg mb-2">{title}</h2>
        <div className="text-sm text-[var(--slate)] mb-6">{description}</div>
        <div className="flex justify-end gap-3">
          <button type="button" className="button button-outline border border-[var(--ink)] text-[var(--ink)]" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="button button-dark" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
