import { z } from 'zod';
import { ACCENT_COLOURS, BACKGROUND_IMAGES, DARK_COLOURS, FONTS, HEADING_COLOURS, PAGE_COLOURS, SITE_PAGES, type SitePage } from './types.ts';
import { PHOTO_OPTIONS } from './page-photos.ts';
import { SITE_LOGO_IDS } from '../brand/logo-concepts.ts';

const fontName = z.string().refine((name) => FONTS.some((f) => f.name === name), 'Unknown font');
const pageColour = z.string().refine((c) => PAGE_COLOURS.some((p) => p.value === c), 'Unknown colour');
const darkColour = z.string().refine((c) => DARK_COLOURS.some((d) => d.value === c), 'Unknown colour');
const pageColours = z.object({ background: pageColour, text: pageColour, title: darkColour, box: darkColour });
const plainText = (max: number) => z.string().max(max).refine((s) => !/[<>]/.test(s), 'No HTML allowed');

/** Everything here ends up inside a <style> tag or page markup, so it is strictly whitelisted. */
export const siteDesignSchema = z.object({
  background: z.object({
    kind: z.enum(['image', 'white', 'colour']),
    imageId: z.string().refine((id) => BACKGROUND_IMAGES.some((b) => b.id === id), 'Unknown background'),
    customUrl: z
      .string()
      .max(500)
      .refine((u) => u === '' || /^(https:\/\/|\/(?!\/))[^\s"'()<>\\]+$/.test(u), 'Invalid image address'),
    colour: z.string().refine((c) => c === '' || PAGE_COLOURS.some((p) => p.value === c), 'Unknown colour'),
  }),
  homeLayout: z.enum(['centred', 'split', 'band']),
  pageLayout: z.enum(['stacked', 'side', 'centred']),
  headingFont: fontName,
  bodyFont: fontName,
  headingSize: z.number().int().min(80).max(140),
  bodySize: z.number().int().min(14).max(20),
  menuSize: z.number().int().min(11).max(18),
  headingColour: z.string().refine((c) => HEADING_COLOURS.some((h) => h.value === c), 'Unknown colour'),
  buttonColour: z.string().refine((c) => DARK_COLOURS.some((b) => b.value === c), 'Unknown colour'),
  headerColour: pageColour,
  footerColour: darkColour,
  accentColour: z.string().refine((c) => ACCENT_COLOURS.some((a) => a.value === c), 'Unknown colour'),
  hoverColour: darkColour,
  headerStyle: z.enum(['split', 'centred']),
  stickyHeader: z.boolean().default(true),
  logo: z.string().refine((id) => id === '' || SITE_LOGO_IDS.includes(id), 'Unknown logo'),
  text: z.object({
    homeHeading: plainText(120).refine((s) => s.trim().length > 0, 'Heading is required'),
    homeTagline: plainText(240),
    contactEmail: z.string().email().max(200).or(z.literal('')),
    abn: z.string().max(20).regex(/^[0-9 ]*$/, 'ABN should be digits'),
  }),
  seo: z.object({
    title: plainText(70),
    description: plainText(300),
    keywords: plainText(300),
  }),
  pageColours: z.object(Object.fromEntries(SITE_PAGES.map((p) => [p.id, pageColours])) as Record<SitePage, typeof pageColours>),
  photoFrames: z.object(
    Object.fromEntries(
      SITE_PAGES.map((p) => [
        p.id,
        z.object({
          x: z.number().int().min(0).max(100),
          y: z.number().int().min(0).max(100),
          zoom: z.number().int().min(100).max(250),
          opacity: z.number().int().min(20).max(100),
        }),
      ])
    ) as Record<SitePage, z.ZodObject<{ x: z.ZodNumber; y: z.ZodNumber; zoom: z.ZodNumber; opacity: z.ZodNumber }>>
  ),
  // Only that page's own photos.
  photos: z.object(
    Object.fromEntries(
      SITE_PAGES.map((p) => [p.id, z.string().refine((id) => PHOTO_OPTIONS[p.id].some((o) => o.id === id), 'Unknown photo')])
    ) as Record<SitePage, z.ZodString>
  ),
});
