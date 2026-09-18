import { notFound } from 'next/navigation';
import { getPageById, getSiteContent } from '@/lib/content/content';
import { PageEditorClient } from '@/ui/admin/PageEditorClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: 'Edit page' };

export default async function EditPage({ params }: PageProps) {
  const { id } = await params;
  const page = await getPageById(id, 'draft');
  if (!page) notFound();

  // Home's preview reuses About's copy, same as the public page — fetch the
  // current draft About content once so that preview matches reality.
  const aboutForHomePreview =
    page.coreKey === 'home'
      ? (await getSiteContent('draft')).pages.find((p) => p.coreKey === 'about')?.about
      : undefined;

  return <PageEditorClient page={page} aboutForHomePreview={aboutForHomePreview} />;
}
