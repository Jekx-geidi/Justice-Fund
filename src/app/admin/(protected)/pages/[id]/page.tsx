import { notFound } from 'next/navigation';
import { getPageById } from '@/lib/content/content';
import { PageEditorClient } from '@/ui/admin/PageEditorClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: 'Edit page' };

export default async function EditPage({ params }: PageProps) {
  const { id } = await params;
  const page = await getPageById(id, 'draft');
  if (!page) notFound();

  return <PageEditorClient page={page} />;
}
