import type { SiteDesign } from './types.ts';

const pad = (n: number) => String(n).padStart(2, '0');

/** `iejf-design-2026-09-29.pdf`: every format shares the local export date. */
export function exportFilename(now: Date, ext: string) {
  return `iejf-design-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.${ext}`;
}

/**
 * The file a visitor downloads from Site settings and emails to us, so their picks can be loaded
 * into the site later. `design` is the full SiteDesign, unchanged, so it can be saved as-is.
 */
export function designExport(design: SiteDesign, page: string, now: Date) {
  const file = { kind: 'iejf-site-design', version: 1, exportedAt: now.toISOString(), page, design };
  return { filename: exportFilename(now, 'json'), json: JSON.stringify(file, null, 2) };
}

/** Display names for the picks, passed in by the caller so this file stays free of app imports. */
export type DesignNames = {
  backgrounds: { id: string; label: string }[];
  colours: { name: string; value: string }[];
  logos: { id: string; name: string }[];
};

export type DesignSummary = {
  title: string;
  exported: string;
  sections: { heading: string; rows: { label: string; value: string }[] }[];
};

// Same wording as the Site settings panel, so the summary reads like what she clicked.
const HOME_LAYOUTS: Record<SiteDesign['homeLayout'], string> = { centred: 'Centred box', split: 'Split', band: 'Bottom band' };
const PAGE_LAYOUTS: Record<SiteDesign['pageLayout'], string> = { stacked: 'Stacked', side: 'Heading on side', centred: 'Centred' };
const HEADERS: Record<SiteDesign['headerStyle'], string> = { split: 'Name left, menu right', centred: 'Everything centred' };

/** A plain-language list of the design choices, for the readable export formats (PDF, Word, text, Markdown). */
export function designSummary(design: SiteDesign, names: DesignNames, now: Date): DesignSummary {
  const { background: bg, text } = design;
  const background =
    bg.kind === 'white' ? 'Plain white' : (names.backgrounds.find((b) => b.id === bg.imageId)?.label ?? bg.imageId);
  const colour = names.colours.find((c) => c.value === design.headingColour)?.name ?? design.headingColour;
  const logo = design.logo ? (names.logos.find((l) => l.id === design.logo)?.name ?? design.logo) : 'Name only';
  return {
    title: 'IEJF website design choices',
    exported: now.toLocaleString('en-AU', { dateStyle: 'long', timeStyle: 'short' }),
    sections: [
      {
        heading: 'Look',
        rows: [
          { label: 'Background', value: background },
          { label: 'Homepage layout', value: HOME_LAYOUTS[design.homeLayout] },
          { label: 'About, Insights and Contact layout', value: PAGE_LAYOUTS[design.pageLayout] },
          { label: 'Header', value: HEADERS[design.headerStyle] },
          { label: 'Logo', value: logo },
          { label: 'Heading colour', value: colour },
        ],
      },
      {
        heading: 'Fonts and sizes',
        rows: [
          { label: 'Headings font', value: design.headingFont },
          { label: 'Body text font', value: design.bodyFont },
          { label: 'Heading size', value: `${design.headingSize}%` },
          { label: 'Body text size', value: `${design.bodySize}px` },
          { label: 'Menu size', value: `${design.menuSize}px` },
        ],
      },
      {
        heading: 'Text',
        rows: [
          { label: 'Homepage heading', value: text.homeHeading },
          { label: 'Homepage tagline', value: text.homeTagline || 'None' },
          { label: 'Contact email', value: text.contactEmail },
          { label: 'ABN', value: text.abn },
        ],
      },
    ],
  };
}

export function designText(summary: DesignSummary) {
  const sections = summary.sections.map(
    (s) => `${s.heading.toUpperCase()}\n${s.rows.map((r) => `  ${r.label}: ${r.value}`).join('\n')}`
  );
  return `${summary.title}\nExported ${summary.exported}\n\n${sections.join('\n\n')}\n`;
}

export function designMarkdown(summary: DesignSummary) {
  const sections = summary.sections.map(
    (s) => `## ${s.heading}\n\n${s.rows.map((r) => `- **${r.label}:** ${r.value}`).join('\n')}`
  );
  return `# ${summary.title}\n\n_Exported ${summary.exported}_\n\n${sections.join('\n\n')}\n`;
}
