import type { MarkConcept } from '@/lib/brand/marks';

export function MarkIcon({ mark, size = 28 }: { mark: MarkConcept; size?: number }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: mark.svg }}
    />
  );
}
