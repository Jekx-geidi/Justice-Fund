import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s — IEJF Admin' },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="admin-root">{children}</div>;
}
