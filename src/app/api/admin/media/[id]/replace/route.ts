import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/guard';
import { saveUploadedImage, UploadRejectedError } from '@/lib/media/upload';
import { replaceMediaFile } from '@/lib/media/library';
import { audit } from '@/lib/security/log';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;
  const { id } = await params;

  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'A replacement file is required.' }, { status: 400 });
  }

  try {
    // Alt text isn't known yet at this point — reuse a placeholder; the
    // existing record's alt_text is left untouched by replaceMediaFile.
    const image = await saveUploadedImage(file, 'replacement');
    const media = await replaceMediaFile(id, image);
    if (!media) {
      return NextResponse.json({ error: 'Media not found.' }, { status: 404 });
    }
    audit({ event: 'media_replace', admin: session, resourceId: id, result: 'success' });
    return NextResponse.json({ media });
  } catch (error) {
    const message = error instanceof UploadRejectedError ? error.message : 'The original image has not been changed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
