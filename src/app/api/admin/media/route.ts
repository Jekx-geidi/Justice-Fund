import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/guard';
import { saveUploadedImage, UploadRejectedError } from '@/lib/media/upload';
import { addMediaRecord, listMedia } from '@/lib/media/library';
import { audit } from '@/lib/security/log';

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;

  const items = await listMedia();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;

  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  const alt = form?.get('alt');

  if (!(file instanceof File) || typeof alt !== 'string' || alt.trim().length === 0) {
    return NextResponse.json({ error: 'A file and alt text are required.' }, { status: 400 });
  }

  try {
    const media = await saveUploadedImage(file, alt.trim());
    await addMediaRecord(media);
    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    const message = error instanceof UploadRejectedError ? error.message : 'Upload failed.';
    audit({ event: 'media_upload_failure', admin: session, result: 'failure' });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
