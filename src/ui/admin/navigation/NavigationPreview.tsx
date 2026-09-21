export function NavigationPreview({ labels }: { labels: string[] }) {
  return (
    <div className="bg-[var(--paper)] border border-[var(--line)] p-3">
      <p className="text-xs text-[var(--slate)] uppercase tracking-wide mb-2">Website Navigation Preview</p>
      {labels.length === 0 ? (
        <p className="text-sm text-[var(--slate)]">No items are visible in the menu.</p>
      ) : (
        <p className="text-sm">{labels.join('  |  ')}</p>
      )}
    </div>
  );
}
