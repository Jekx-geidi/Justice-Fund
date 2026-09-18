import { getSiteContent } from '@/lib/content/content';
import { InsightsManagerClient } from '@/ui/admin/InsightsManagerClient';

export const metadata = { title: 'Insights' };

export default async function AdminInsights() {
  const draft = await getSiteContent('draft');
  const entries = [...draft.insights].sort((a, b) => a.order - b.order);

  return (
    <div>
      <p className="eyebrow">INSIGHTS</p>
      <h1 className="text-3xl mt-2 mb-6">Insights entries</h1>
      <InsightsManagerClient entries={entries} />
    </div>
  );
}
