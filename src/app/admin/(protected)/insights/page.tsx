import { deriveNavigation, getDesign, getSiteContent } from '@/lib/content/content';
import { InsightsManagerClient } from '@/ui/admin/InsightsManagerClient';

export const metadata = { title: 'Insights' };

export default async function AdminInsights() {
  const [draft, design] = await Promise.all([getSiteContent('draft'), getDesign('draft')]);
  const entries = [...draft.insights].sort((a, b) => a.order - b.order);

  // The preview wears the public site's header, footer and Site settings look, like the page editors.
  return <InsightsManagerClient entries={entries} site={{ design, navigation: deriveNavigation(draft) }} />;
}
