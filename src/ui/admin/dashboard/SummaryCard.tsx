export function SummaryCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="bg-white border border-[var(--line)] p-4">
      <p className="text-xs text-[var(--slate)] uppercase tracking-wide">{label}</p>
      <p className="text-3xl mt-2">{value}</p>
      {note && <p className="text-xs text-[var(--slate)] mt-1">{note}</p>}
    </div>
  );
}
