import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Artwork comparison',
  robots: { index: false, follow: false },
};

export default function BrandArtworkLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
