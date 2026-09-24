import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/auth/guard';
import { publishDesign } from '@/lib/content/content';
import { audit } from '@/lib/security/log';

export async function POST(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;

  try {
    const design = await publishDesign();
    revalidatePath('/', 'layout');
    audit({ event: 'publish', admin: session, result: 'success' });
    return NextResponse.json({ design });
  } catch (error) {
    console.error(error);
    audit({ event: 'publish', admin: session, result: 'failure' });
    return NextResponse.json({ error: "We couldn't publish. Your changes are still saved." }, { status: 500 });
  }
}
