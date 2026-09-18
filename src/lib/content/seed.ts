import type { SiteContent } from './types';

/**
 * Initial content, seeded once when no stored content exists yet.
 * Matches IEJF's confirmed 17 September 2026 content (Admin.md section 2.1).
 */
export function buildSeedContent(): SiteContent {
  const now = new Date().toISOString();

  const seed: SiteContent = {
    site: { name: 'Intergenerational Justice Fund' },
    updatedAt: now,
    insights: [],
    pages: [
      {
        id: 'core-home',
        title: 'Home',
        slug: '',
        navLabel: 'Home',
        isCore: true,
        coreKey: 'home',
        showInNavigation: true,
        navOrder: 0,
        status: 'published',
        seo: {
          title: 'Intergenerational Justice Fund',
          description:
            'We use the law to drive systemic change, targeting issues that will cause escalating harm to future generations if left unaddressed.',
        },
        home: {
          eyebrow: 'A NOT-FOR-PROFIT CHARITY',
          heading: 'Intergenerational Justice Fund',
          mission:
            'We use the law to drive systemic change, targeting issues that will cause escalating harm to future generations if left unaddressed.',
          heroImage: null,
          quotes: [
            {
              text: "This case shows what's possible when a small legal team takes on a question no one else will ask.",
              attribution: 'The Guardian, on a matter supported by IEJF',
            },
            {
              text: "A landmark moment for how courts weigh the interests of people who aren't born yet.",
              attribution: 'The Conversation',
            },
            {
              text: "It's Mabo for the climate — a case young Australians will point back to.",
              attribution: 'Sydney Morning Herald',
            },
          ],
          bottomLine: 'Intergenerational Environment Justice Fund (ABN 51 656 623 719)',
        },
        blocks: [],
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
      },
      {
        id: 'core-about',
        title: 'About',
        slug: 'about',
        navLabel: 'About',
        isCore: true,
        coreKey: 'about',
        showInNavigation: true,
        navOrder: 1,
        status: 'published',
        seo: {
          title: 'About — Intergenerational Justice Fund',
          description:
            'Intergenerational Justice Fund Limited is an Australian charity advancing charitable purposes for the public benefit that carry an intergenerational impact.',
        },
        about: {
          intro:
            'Intergenerational Justice Fund Limited is an Australian charity dedicated to advancing charitable purposes for the public benefit that carry an intergenerational impact.',
          body: 'We use the law to drive systemic change, targeting issues that will cause escalating harm to future generations if left unaddressed. To that end, we build and fund strategic collaborations in Australia and overseas on charitable projects spanning strategic litigation, advocacy for legislative and regulatory reform, research and investigations, shareholder action, communication and education.',
          focusAreas: [
            {
              title: 'Environment',
              description:
                'We advance the protection, promotion and enhancement of the natural environment through our own research and by funding research and legal action.',
              entity: 'Intergenerational Environment Justice Fund Limited',
              abn: '51 656 623 719',
            },
            {
              title: 'Health',
              description:
                'Our focus is promoting the prevention or control of human diseases through our own research and by funding research and legal action.',
              entity: 'Intergenerational Health Justice Fund Limited',
              abn: '28 658 260 194',
            },
            {
              title: 'Human Rights',
              description:
                'Our purpose is to prevent and control behaviours that harm people, with a focus on emotional abuse, physical abuse, suicide and self-harm. We address these harms through education, research, legal action and advocacy.',
              entity: 'Intergenerational Human Rights Justice Fund Limited',
              abn: '23 659 732 331',
            },
          ],
        },
        blocks: [],
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
      },
      {
        id: 'core-insights',
        title: 'Insights',
        slug: 'insights',
        navLabel: 'Insights',
        isCore: true,
        coreKey: 'insights',
        showInNavigation: true,
        navOrder: 2,
        status: 'published',
        seo: {
          title: 'Insights — Intergenerational Justice Fund',
          description: 'Case updates, research and advocacy from the Intergenerational Justice Fund.',
        },
        blocks: [],
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
      },
      {
        id: 'core-contact',
        title: 'Contact',
        slug: 'contact',
        navLabel: 'Contact',
        isCore: true,
        coreKey: 'contact',
        showInNavigation: true,
        navOrder: 3,
        status: 'published',
        seo: {
          title: 'Contact — Intergenerational Justice Fund',
          description: 'Get in touch with the Intergenerational Justice Fund in Perth, WA.',
        },
        contact: {
          location: 'Perth, WA',
          email: 'hello@justicefund.org.au',
        },
        blocks: [],
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
      },
    ],
  };

  return seed;
}
