import { z } from 'zod';
import { mediaReferenceSchema } from '@/lib/content/schemas';

export const updateProfileSchema = z.object({
  avatar: mediaReferenceSchema.nullable(),
});

export const createAdminUserSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(150),
  email: z.string().email().max(200),
});

export const updateAdminUserSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  isActive: z.boolean().optional(),
});

export const activateAccountSchema = z.object({
  token: z.string().min(1).max(200),
  password: z.string().min(10, 'Password must be at least 10 characters.').max(200),
});
