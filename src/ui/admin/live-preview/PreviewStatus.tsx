export function PreviewStatus({ dirty }: { dirty: boolean }) {
  return (
    <span role="status" className="text-xs text-[var(--slate)]">
      {dirty ? 'Unsaved changes — not visible to website visitors' : 'Matches last saved draft'}
    </span>
  );
}
