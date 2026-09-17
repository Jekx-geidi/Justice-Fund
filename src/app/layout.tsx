import type { Metadata } from 'next';
import '@fontsource/marcellus/latin-400.css';
import Header from '@/ui/Header';
import { Footer } from '@/ui/Editorial';
import './globals.css';
export const metadata: Metadata = { title: { default: 'Intergenerational Justice Fund', template: '%s — Intergenerational Justice Fund' }, description: 'We use the law to drive systemic change, targeting issues that will cause escalating harm to future generations if left unaddressed.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-AU"><body><a className="skip-link" href="#main">Skip to content</a><Header /><main id="main" tabIndex={-1}>{children}</main><Footer /></body></html>;
}
