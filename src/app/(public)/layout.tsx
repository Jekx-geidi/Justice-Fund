import type { Metadata } from 'next';
import Header from '@/ui/Header';
import { Footer } from '@/ui/Editorial';
import { deriveNavigation, getDesign, getSiteContent } from '@/lib/content/content';
import { designCss } from '@/lib/design/types';
import { getViewerDesign } from '@/lib/design/viewer';
import { SiteSettingsPanel } from '@/ui/site-settings/SiteSettingsPanel';
export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getDesign('live');
  return {
    title: { default: seo.title, template: `%s — ${seo.title}` },
    description: seo.description,
    keywords: seo.keywords.split(',').map((k) => k.trim()).filter(Boolean),
  };
}

export default async function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [content, { design, live, isAdmin }] = await Promise.all([getSiteContent('live'), getViewerDesign()]);
  const navigation = deriveNavigation(content);
  const hasPrivacyPage =content.pages.some((page) => page.slug === 'privacy' && page.status === 'published');

  return (
    <div
      className="site-shell"
      data-home-layout={design.homeLayout}
      data-page-layout={design.pageLayout}
      data-header-style={design.headerStyle}
      data-editor=""
    >
      {/* Validated server-side (siteDesignSchema) before it can be saved, so it's safe to inline. */}
      <style id="site-design-css" dangerouslySetInnerHTML={{ __html: designCss(design) }} />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header navigation={navigation} logo={design.logo} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer abn={design.text.abn} privacyHref={hasPrivacyPage ? '/privacy' : null} />
      {/* Everyone gets the gear so the settings can be tried on the live site. Visitors start from the published look and
          only preview on their own screen; saving and publishing need a fully signed-in admin (also enforced by the API). */}
      <SiteSettingsPanel initialDraft={design} live={live} canSave={isAdmin} />
    </div>
  );
}
