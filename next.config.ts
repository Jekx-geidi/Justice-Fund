import type { NextConfig } from 'next';

// Supabase Storage serves uploaded media from this project's own subdomain
// (public bucket "IMAGES IEJF") — allow-listed by exact host, not a *.supabase.co
// wildcard, so other Supabase projects' buckets stay untrusted.
const SUPABASE_HOST = 'fxpznpdrpzgkwplghvqx.supabase.co';

// Phase 1 CSP: 'unsafe-inline' on script-src is a known trade-off to allow
// Next.js's own inline hydration bootstrap without nonce plumbing. Moving to
// a nonce-based CSP is a documented Phase 1.1 hardening item (Admin.md 23).
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://${SUPABASE_HOST}`,
  "font-src 'self' data:",
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
  output: 'standalone',
  turbopack: { root: process.cwd() },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: SUPABASE_HOST, pathname: '/storage/v1/object/public/**' }],
  },
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
};

export default config;
