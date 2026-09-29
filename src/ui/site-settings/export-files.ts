import { BACKGROUND_IMAGES, HEADING_COLOURS, type SiteDesign } from '@/lib/design/types';
import { SITE_LOGOS } from '@/lib/brand/logo-concepts';
import {
  designExport,
  designMarkdown,
  designSummary,
  designText,
  exportFilename,
  type DesignSummary,
} from '@/lib/design/export';

export const EXPORT_FORMATS = [
  { id: 'pdf', label: 'PDF', ext: 'pdf' },
  { id: 'docx', label: 'Word', ext: 'docx' },
  { id: 'txt', label: 'Text', ext: 'txt' },
  { id: 'md', label: 'Markdown', ext: 'md' },
  { id: 'json', label: 'For the web team', ext: 'json' },
] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number]['id'];

const NAMES = {
  backgrounds: BACKGROUND_IMAGES,
  colours: HEADING_COLOURS,
  logos: SITE_LOGOS,
};

async function pdfBlob(summary: DesignSummary) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const left = 56;
  const width = doc.internal.pageSize.getWidth() - left * 2;
  const bottom = doc.internal.pageSize.getHeight() - 56;
  let y = 72;
  const line = (text: string, size: number, style: 'normal' | 'bold', gap: number) => {
    doc.setFont('helvetica', style).setFontSize(size);
    for (const part of doc.splitTextToSize(text, width) as string[]) {
      if (y > bottom) {
        doc.addPage();
        y = 72;
      }
      doc.text(part, left, y);
      y += size * 1.35;
    }
    y += gap;
  };
  line(summary.title, 18, 'bold', 2);
  line(`Exported ${summary.exported}`, 10, 'normal', 14);
  for (const section of summary.sections) {
    line(section.heading, 13, 'bold', 4);
    for (const row of section.rows) line(`${row.label}: ${row.value}`, 11, 'normal', 2);
    y += 10;
  }
  return doc.output('blob');
}

async function docxBlob(summary: DesignSummary) {
  const { Document, HeadingLevel, Packer, Paragraph, TextRun } = await import('docx');
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: summary.title, heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ children: [new TextRun({ text: `Exported ${summary.exported}`, italics: true })] }),
          ...summary.sections.flatMap((section) => [
            new Paragraph({ text: section.heading, heading: HeadingLevel.HEADING_2 }),
            ...section.rows.map(
              (row) => new Paragraph({ children: [new TextRun({ text: `${row.label}: `, bold: true }), new TextRun(row.value)] })
            ),
          ]),
        ],
      },
    ],
  });
  return Packer.toBlob(doc);
}

/** Builds the chosen file in the browser and returns it with its name; nothing is sent anywhere. */
export async function buildDesignFile(format: ExportFormat, design: SiteDesign, page: string, now = new Date()) {
  const ext = EXPORT_FORMATS.find((f) => f.id === format)!.ext;
  const filename = exportFilename(now, ext);
  if (format === 'json') return { filename, blob: new Blob([designExport(design, page, now).json], { type: 'application/json' }) };
  const summary = designSummary(design, NAMES, now);
  if (format === 'txt') return { filename, blob: new Blob([designText(summary)], { type: 'text/plain' }) };
  if (format === 'md') return { filename, blob: new Blob([designMarkdown(summary)], { type: 'text/markdown' }) };
  if (format === 'pdf') return { filename, blob: await pdfBlob(summary) };
  return { filename, blob: await docxBlob(summary) };
}
