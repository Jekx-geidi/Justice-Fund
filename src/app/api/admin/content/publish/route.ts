import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/auth/guard';
import { getSiteContent, pageRoute, publishDraft } from '@/lib/content/content';
import { audit } from '@/lib/security/log';

export async function POST(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;

  try {
    await publishDraft();
  } catch (error) {
    console.error(error);
    audit({ event: 'publish', admin: session, result: 'failure' });
    return NextResponse.json(
      { error: "We couldn't publish your changes. Your draft is still saved. Please try again." },
      { status: 500 }
    );
  }

  const live = await getSiteContent('live');
  for (const page of live.pages) {
    revalidatePath(pageRoute(page));
  }

  audit({ event: 'publish', admin: session, result: 'success' });
  return NextResponse.json({ ok: true, publishedAt: live.updatedAt });
}
