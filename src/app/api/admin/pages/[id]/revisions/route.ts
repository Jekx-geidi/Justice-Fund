import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/guard';
import { listRevisions } from '@/lib/content/revisions';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;
  const { id } = await params;

  const revisions = await listRevisions(id);
  return NextResponse.json({ revisions });
}
