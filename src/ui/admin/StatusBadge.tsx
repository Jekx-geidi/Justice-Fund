import type { PageStatus } from '@/lib/content/types';

const LABELS: Record<PageStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  unpublished: 'Unpublished',
};

const CLASSES: Record<PageStatus, string> = {
  draft: 'bg-amber-100 text-amber-800',
  published: 'bg-emerald-100 text-emerald-800',
  unpublished: 'bg-neutral-200 text-neutral-700',
};

export function StatusBadge({ status }: { status: PageStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${CLASSES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
