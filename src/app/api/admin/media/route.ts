import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/guard';
import { saveUploadedImage, UploadRejectedError } from '@/lib/media/upload';
import { addMediaRecord, listMedia } from '@/lib/media/library';
import { mediaCategorySchema } from '@/lib/media/validation';
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
  const title = form?.get('title');
  const categoryRaw = form?.get('category');

  if (!(file instanceof File) || typeof alt !== 'string' || alt.trim().length === 0) {
    return NextResponse.json({ error: 'A file and alt text are required.' }, { status: 400 });
  }

  const categoryResult = mediaCategorySchema.safeParse(categoryRaw ?? 'uncategorized');
  if (!categoryResult.success) {
    return NextResponse.json({ error: 'Invalid category.' }, { status: 400 });
  }

  try {
    const image = await saveUploadedImage(file, alt.trim());
    const media = await addMediaRecord(image, {
      title: typeof title === 'string' && title.trim() ? title.trim() : undefined,
      category: categoryResult.data,
      uploadedBy: session,
    });
    audit({ event: 'media_upload_success', admin: session, resourceId: media.id, result: 'success' });
    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    const message = error instanceof UploadRejectedError ? error.message : "We couldn't upload this image. Please try again.";
    audit({ event: 'media_upload_failure', admin: session, result: 'failure' });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
