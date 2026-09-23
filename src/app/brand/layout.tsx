import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Brand & design comparison',
  robots: { index: false, follow: false },
};

export default function BrandLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="brand-compare">
      <nav className="brand-compare-nav wrap" aria-label="Brand comparison pages">
        <Link href="/">← Site</Link>
        <Link href="/brand">Directions, marks &amp; type</Link>
        <Link href="/brand/artwork">Artwork</Link>
      </nav>
      <main id="main">{children}</main>
    </div>
  );
}
