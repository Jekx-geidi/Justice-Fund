'use client';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function SlugField({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="field">
      <label htmlFor="page-slug">URL slug</label>
      <div className="flex items-center gap-1 text-sm text-[var(--slate)]">
        <span>/</span>
        <input
          id="page-slug"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(slugify(event.target.value))}
          placeholder="research"
          required
        />
      </div>
      <p className="text-xs text-[var(--slate)] mt-1">Lowercase letters, numbers and hyphens only.</p>
    </div>
  );
}

export { slugify };
