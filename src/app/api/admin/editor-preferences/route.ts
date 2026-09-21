import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/guard';
import { getEditorPreferences, updateEditorPreferences } from '@/lib/settings/editorPreferences';
import { editorPreferencesPatchSchema } from '@/lib/settings/validation';
import { audit } from '@/lib/security/log';

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;

  const preferences = await getEditorPreferences();
  return NextResponse.json({ preferences });
}

export async function PUT(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => null);
  const parsed = editorPreferencesPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid preferences.' }, { status: 400 });
  }

  if (parsed.data.previewDevices) {
    const enabledIds = parsed.data.previewDevices.filter((device) => device.enabled).map((device) => device.id);
    if (enabledIds.length === 0) {
      return NextResponse.json({ error: 'At least one preview device must stay enabled.' }, { status: 400 });
    }
  }

  const preferences = await updateEditorPreferences(parsed.data);
  audit({ event: 'editor_preferences_updated', admin: session, result: 'success' });
  return NextResponse.json({ preferences });
}
