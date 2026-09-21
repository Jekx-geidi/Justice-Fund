'use client';

import { useEffect, useRef } from 'react';
import { MaterialButton } from './material/MaterialControls';
import { useMaterialWeb } from './material/useMaterialWeb';

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
  const materialReady = useMaterialWeb([
    () => import('@material/web/button/filled-button.js'),
    () => import('@material/web/button/outlined-button.js'),
  ]);

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
          <MaterialButton ready={materialReady} variant="outlined" onClick={onCancel}>
            Cancel
          </MaterialButton>
          <MaterialButton ready={materialReady} variant="filled" onClick={onConfirm}>
            {confirmLabel}
          </MaterialButton>
        </div>
      </div>
    </dialog>
  );
}
