'use client';

import { useEffect } from 'react';

/** Warns before closing the tab/navigating away with unsaved edits (Admin.md §39). */
export function UnsavedChangesGuard({ dirty }: { dirty: boolean }) {
  useEffect(() => {
    if (!dirty) return;
    function handler(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = '';
    }
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  return null;
}
