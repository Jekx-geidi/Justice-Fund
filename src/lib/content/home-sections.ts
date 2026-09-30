/**
 * Ange's Home page (April's email, 30 Sep). The hero heading and paragraph are Site settings text (so April can
 * edit them live); these are their defaults. The sections below the hero are Home page content in Admin.
 */

export type HomeSections = {
  whatWeDo: { heading: string; intro: string; cards: { title: string; text: string }[] };
  /** Paragraphs separated by a blank line. */
  why: { heading: string; body: string };
};

export const HOME_HERO = {
  heading: 'We’re using law to drive systemic change for future generations',
  paragraph:
    'We target legal issues that will cause escalating harm to future generations if left unaddressed. Through strategic litigation and policy work, we’re building a more just future.',
  actions: [
    { label: 'Get Involved', href: '/contact' },
    { label: 'Learn More', href: '/about' },
  ],
} as const;

export const HOME_SECTIONS: HomeSections = {
  whatWeDo: {
    heading: 'What We Do',
    intro:
      'Our work focuses on the most pressing intergenerational justice issues of our time. We combine legal expertise with strategic thinking to create systemic change.',
    cards: [
      {
        title: 'Strategic Litigation',
        text: 'We bring strategic legal cases that challenge systemic harm and set precedents for future protection of intergenerational rights.',
      },
      {
        title: 'Policy Reform',
        text: 'We work with governments and organisations to reform policies that affect long-term environmental and social sustainability.',
      },
    ],
  },
  why: {
    heading: 'Why Intergenerational Justice Matters',
    // Ange's screenshot cuts off mid-sentence after "the interests of future"; the ending is ours until April sends the rest.
    body: [
      'Every decision made today has consequences for generations to come. Climate change, environmental degradation, and systemic inequality create compounding harms that disproportionately affect those who will inherit a damaged world.',
      'We believe the law is a powerful tool for ensuring that the interests of future generations are protected.',
    ].join('\n\n'),
  },
};

/** Saved Home content, with Ange's copy wherever a section hasn't been saved yet. */
export function homeSections(saved: Partial<HomeSections> | undefined): HomeSections {
  return {
    whatWeDo: saved?.whatWeDo ?? HOME_SECTIONS.whatWeDo,
    why: saved?.why ?? HOME_SECTIONS.why,
  };
}

export function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
