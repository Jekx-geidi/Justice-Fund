'use client';

import type { NavItem } from '@/lib/content/content';
import { designCss, type SiteDesign } from '@/lib/design/types';
import Header from '@/ui/Header';
import { Footer } from '@/ui/Editorial';

export interface SitePreviewContext {
  /** The Site settings draft, i.e. what a signed-in editor sees on the public site. */
  design: SiteDesign;
  navigation: NavItem[];
}

/**
 * Wraps a page preview in the same shell the public layout renders (Site settings
 * stylesheet, header, footer), so the admin preview is the page visitors get, not a
 * bare fragment on white.
 */
export function SitePreviewShell({ site, children }: { site: SitePreviewContext; children: React.ReactNode }) {
  const { design } = site;
  return (
    <div
      className="site-shell"
      data-home-layout={design.homeLayout}
      data-page-layout={design.pageLayout}
      data-header-style={design.headerStyle}
    >
      <style dangerouslySetInnerHTML={{ __html: designCss(design) }} />
      <Header navigation={site.navigation} logo={design.logo} />
      <main>{children}</main>
      <Footer abn={design.text.abn} />
    </div>
  );
}
