import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/guard';
import { getSiteSettings, updateSiteSettings } from '@/lib/settings/siteSettings';
import { siteSettingsPatchSchema } from '@/lib/settings/validation';
import { audit } from '@/lib/security/log';

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;

  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => null);
  const parsed = siteSettingsPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid settings.' }, { status: 400 });
  }

  const settings = await updateSiteSettings(parsed.data);
  audit({ event: 'settings_updated', admin: session, result: 'success' });
  return NextResponse.json({ settings });
}
