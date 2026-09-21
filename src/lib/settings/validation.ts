import { z } from 'zod';

export const siteSettingsPatchSchema = z.object({
  orgName: z.string().max(150).optional(),
  contactEmail: z.string().email().max(200).or(z.literal('')).optional(),
  location: z.string().max(200).optional(),
  footerText: z.string().max(300).optional(),
  seoTitle: z.string().max(160).optional(),
  seoDescription: z.string().max(300).optional(),
  logoUrl: z.string().max(500).optional(),
});
