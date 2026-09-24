import type { NextConfig } from 'next';

// Supabase Storage serves uploaded media from this project's own subdomain
// (public bucket "IMAGES IEJF") — allow-listed by exact host, not a *.supabase.co
// wildcard, so other Supabase projects' buckets stay untrusted.
const SUPABASE_HOST = 'fxpznpdrpzgkwplghvqx.supabase.co';

// Phase 1 CSP: 'unsafe-inline' on script-src is a known trade-off to allow
// Next.js's own inline hydration bootstrap without nonce plumbing. Moving to
// a nonce-based CSP is a documented Phase 1.1 hardening item (Admin.md 23).
//
// 'unsafe-eval' is added to script-src in dev only: Next dev's Turbopack/RSC
// client runtime uses eval() for HMR and stack-trace reconstruction. React
// never uses eval() in production, so prod's CSP stays as strict as before.
const isDev = process.env.NODE_ENV !== 'production';
// Fonts April picks in the Site settings panel load from Google Fonts on every
// public page, so production allows them too (not just brand-chooser previews).
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  `img-src 'self' data: blob: https://${SUPABASE_HOST}`,
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: CSP },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const config: NextConfig = {
  // 'standalone' output is for the existing Docker/Cloud Run deployment
  // (see Dockerfile — copies .next/standalone into the runtime image).
  // Vercel's own Next.js builder doesn't use or want this output mode; it
  // sets VERCEL=1 during its build, so this only ever applies off-Vercel.
  output: process.env.VERCEL ? undefined : 'standalone',
  turbopack: { root: process.cwd() },
  // Keeps the Next.js dev badge out of review screenshots; it never ships in production builds anyway.
  devIndicators: false,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: SUPABASE_HOST, pathname: '/storage/v1/object/public/**' }],
  },
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
};

export default config;
