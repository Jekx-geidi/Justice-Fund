import { notFound } from 'next/navigation';

export default async function Page() {
  if (process.env.NEXT_PUBLIC_BRAND_CHOOSER !== 'true') notFound();
  const { default: Preview } = await import('@/ui/brand/BrandArtworkPage');
  return <Preview />;
}
