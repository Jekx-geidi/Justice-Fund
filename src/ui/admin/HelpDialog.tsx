'use client';

import { useEffect, useRef } from 'react';

export function HelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="confirm-dialog" onCancel={onClose} aria-label="Help">
      <div className="p-6">
        <h2 className="text-lg mb-4">Quick help</h2>
        <ul className="text-sm text-[var(--slate)] space-y-3 mb-6">
          <li>
            <strong className="text-[var(--ink)]">Save draft</strong> never goes live — it only saves your work.
            Nothing changes on the public website until you click <strong className="text-[var(--ink)]">Publish</strong>.
          </li>
          <li>
            <strong className="text-[var(--ink)]">Live Draft Preview</strong> (right side of an editor) updates
            instantly as you type. <strong className="text-[var(--ink)]">Open Full Preview</strong> shows the real
            page using your last saved draft.
          </li>
          <li>
            <strong className="text-[var(--ink)]">History</strong> on a page editor lets you preview and restore an
            older published version — restoring only updates your draft, it doesn&rsquo;t publish automatically.
          </li>
          <li>
            Need more help?{' '}
            <a href="mailto:hello@justicefund.org.au" className="underline text-[var(--ink)]">
              hello@justicefund.org.au
            </a>
          </li>
        </ul>
        <div className="flex justify-end">
          <button type="button" className="button button-dark" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}
