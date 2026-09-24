import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/guard';
import { resetDesignDraft } from '@/lib/content/content';
import { audit } from '@/lib/security/log';

export async function POST(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;

  const design = await resetDesignDraft();
  audit({ event: 'draft_save', admin: session, result: 'success' });
  return NextResponse.json({ design });
}
