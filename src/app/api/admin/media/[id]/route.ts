import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/guard';
import { getMediaUsage, removeMediaRecord, updateMediaRecord } from '@/lib/media/library';
import { mediaMetadataPatchSchema } from '@/lib/media/validation';
import { audit } from '@/lib/security/log';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const result = mediaMetadataPatchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid metadata.' }, { status: 400 });
  }

  const media = await updateMediaRecord(id, result.data);
  if (!media) {
    return NextResponse.json({ error: 'Media not found.' }, { status: 404 });
  }

  audit({ event: 'media_update', admin: session, resourceId: id, result: 'success' });
  return NextResponse.json({ media });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const usage = await getMediaUsage(id);
  if (usage.length > 0 && body?.force !== true) {
    audit({ event: 'media_delete_blocked', admin: session, resourceId: id, result: 'failure' });
    return NextResponse.json(
      {
        error: 'This image is still used on the website and cannot be deleted yet.',
        referenced: true,
        usage,
      },
      { status: 409 }
    );
  }

  await removeMediaRecord(id);
  audit({ event: 'media_delete', admin: session, resourceId: id, result: 'success' });
  return NextResponse.json({ ok: true });
}
