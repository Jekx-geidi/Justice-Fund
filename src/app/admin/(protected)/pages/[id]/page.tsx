import { notFound } from 'next/navigation';
import { deriveNavigation, getDesign, getPageById, getSiteContent } from '@/lib/content/content';
import { PageEditorClient } from '@/ui/admin/PageEditorClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: 'Edit page' };

export default async function EditPage({ params }: PageProps) {
  const { id } = await params;
  const page = await getPageById(id, 'draft');
  if (!page) notFound();

  const [draftContent, design] = await Promise.all([getSiteContent('draft'), getDesign('draft')]);
  const aboutForHomePreview = page.coreKey === 'home' ? draftContent.pages.find((p) => p.coreKey === 'about')?.about : undefined;

  // The preview wears the same header, footer and Site settings look as the public site (draft, as an editor sees it).
  return (
    <PageEditorClient
      page={page}
      aboutForHomePreview={aboutForHomePreview}
      site={{ design, navigation: deriveNavigation(draftContent) }}
    />
  );
}
