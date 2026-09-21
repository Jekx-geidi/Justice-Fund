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

const previewDevicePresetSchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().min(1).max(60),
  width: z.number().int().min(280).max(2560),
  enabled: z.boolean(),
  builtIn: z.boolean(),
});

export const editorPreferencesPatchSchema = z.object({
  livePreviewEnabled: z.boolean().optional(),
  autoSaveEnabled: z.boolean().optional(),
  autoSaveDelaySeconds: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(5)]).optional(),
  previewDevices: z.array(previewDevicePresetSchema).min(1).max(12).optional(),
  defaultPreviewDeviceId: z.string().min(1).max(64).optional(),
  rememberLastPreviewDevice: z.boolean().optional(),
  highlightActiveField: z.boolean().optional(),
  warnUnsavedChanges: z.boolean().optional(),
});
