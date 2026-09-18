import type { Metadata } from 'next';
import '@fontsource/marcellus/latin-400.css';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Intergenerational Justice Fund', template: '%s — Intergenerational Justice Fund' },
  description:
    'We use the law to drive systemic change, targeting issues that will cause escalating harm to future generations if left unaddressed.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU">
      <body>{children}</body>
    </html>
  );
}
