import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/guard';
import { isMediaReferencedInLive, removeMediaRecord } from '@/lib/media/library';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const referenced = await isMediaReferencedInLive(id);
  if (referenced && body?.force !== true) {
    return NextResponse.json(
      { error: 'This image is used on the live site. Confirm to delete it anyway.', referenced: true },
      { status: 409 }
    );
  }

  await removeMediaRecord(id);
  return NextResponse.json({ ok: true });
}
