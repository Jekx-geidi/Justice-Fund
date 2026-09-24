import type { Metadata } from 'next';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import './globals.css';
import { BRAND_CHOOSER_ENABLED } from '@/lib/brand/env';
import { buildPrePaintScript } from '@/lib/brand/pre-paint';
export const metadata: Metadata = {
  title: { default: 'Intergenerational Justice Fund', template: '%s — Intergenerational Justice Fund' },
  description:
    'We use the law to drive systemic change, targeting issues that will cause escalating harm to future generations if left unaddressed.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-AU"
      suppressHydrationWarning={BRAND_CHOOSER_ENABLED}
      {...(BRAND_CHOOSER_ENABLED ? {} : { 'data-brand': 'b' })}
    >
      <head>
        {BRAND_CHOOSER_ENABLED && <script dangerouslySetInnerHTML={{ __html: buildPrePaintScript() }} />}
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
