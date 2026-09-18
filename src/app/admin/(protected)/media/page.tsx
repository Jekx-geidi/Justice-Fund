import { listMedia } from '@/lib/media/library';
import { MediaLibraryClient } from '@/ui/admin/MediaLibraryClient';

export const metadata = { title: 'Media' };

export default async function AdminMedia() {
  const items = await listMedia();

  return (
    <div>
      <p className="eyebrow">MEDIA</p>
      <h1 className="text-3xl mt-2 mb-6">Media library</h1>
      <MediaLibraryClient initialItems={items} />
    </div>
  );
}
