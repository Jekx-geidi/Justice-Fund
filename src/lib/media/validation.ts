import { z } from 'zod';
import { MEDIA_CATEGORIES } from './types';

export const mediaCategorySchema = z.enum(MEDIA_CATEGORIES);

export const mediaMetadataPatchSchema = z.object({
  title: z.string().max(150).nullable().optional(),
  altText: z.string().max(300).optional(),
  caption: z.string().max(300).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  category: mediaCategorySchema.optional(),
  focalX: z.number().min(0).max(1).optional(),
  focalY: z.number().min(0).max(1).optional(),
});
