import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPageBySlug } from '@/lib/content/content';
import { resolveVersion } from '@/lib/content/preview';
import { PreviewBanner } from '@/ui/PreviewBanner';
import { BlockRenderer } from '@/ui/blocks/BlockRenderer';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug, 'live');
  if (!page || page.status !== 'published') return {};
  return {
    title: page.seo.title || page.title,
    description: page.seo.description,
  };
}

export default async function CustomPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const version = await resolveVersion(await searchParams);
  const page = await getPageBySlug(slug, version);

  // Draft/unpublished pages must never be reachable through the live route
  // (Admin.md §9.5) — 404 for both "doesn't exist" and "not published".
  // Previewing (authenticated, ?preview=1) is the one path allowed to see
  // a draft page ahead of publish.
  if (!page || (version === 'live' && page.status !== 'published')) {
    notFound();
  }

  const hasHero = page.blocks.some((block) => block.type === 'hero');

  return (
    <>
      {version === 'draft' && <PreviewBanner />}
      {!hasHero && (
        <section className="wrap section block-section">
          <h1>{page.title}</h1>
        </section>
      )}
      <BlockRenderer blocks={page.blocks} />
    </>
  );
}
