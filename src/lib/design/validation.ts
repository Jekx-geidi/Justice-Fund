import { z } from 'zod';
import { BACKGROUND_IMAGES, FONTS, HEADING_COLOURS } from './types';
import { SITE_LOGO_IDS } from '@/lib/brand/logo-concepts';

const fontName = z.string().refine((name) => FONTS.some((f) => f.name === name), 'Unknown font');
const plainText = (max: number) => z.string().max(max).refine((s) => !/[<>]/.test(s), 'No HTML allowed');

/** Everything here ends up inside a <style> tag or page markup, so it is strictly whitelisted. */
export const siteDesignSchema = z.object({
  background: z.object({
    kind: z.enum(['image', 'white']),
    imageId: z.string().refine((id) => BACKGROUND_IMAGES.some((b) => b.id === id), 'Unknown background'),
    customUrl: z
      .string()
      .max(500)
      .refine((u) => u === '' || /^(https:\/\/|\/(?!\/))[^\s"'()<>\\]+$/.test(u), 'Invalid image address'),
  }),
  homeLayout: z.enum(['centred', 'split', 'band']),
  pageLayout: z.enum(['stacked', 'side', 'centred']),
  headingFont: fontName,
  bodyFont: fontName,
  headingSize: z.number().int().min(80).max(140),
  bodySize: z.number().int().min(14).max(20),
  menuSize: z.number().int().min(11).max(18),
  headingColour: z.string().refine((c) => HEADING_COLOURS.some((h) => h.value === c), 'Unknown colour'),
  headerStyle: z.enum(['split', 'centred']),
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
});
