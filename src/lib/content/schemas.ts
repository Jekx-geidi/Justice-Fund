import { z } from 'zod';

export const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'login',
  'logout',
  '_admin',
  '_next',
  'home',
  'about',
  'insights',
  'contact',
]);

export const slugSchema = z
  .string()
  .min(1, 'Slug is required.')
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only.')
  .refine((slug) => !RESERVED_SLUGS.has(slug), 'That URL is reserved and cannot be used.');

export const mediaReferenceSchema = z.object({
  id: z.string(),
  url: z.string(),
  alt: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const blockBase = { id: z.string() };

export const heroBlockSchema = z.object({
  ...blockBase,
  type: z.literal('hero'),
  eyebrow: z.string().max(80).optional(),
  heading: z.string().min(1).max(200),
  body: z.string().max(2000).optional(),
  image: mediaReferenceSchema.nullish(),
  alignment: z.enum(['left', 'center']).optional(),
});

export const richTextBlockSchema = z.object({
  ...blockBase,
  type: z.literal('richText'),
  heading: z.string().max(200).optional(),
  body: z.string().max(20000),
});

export const imageTextBlockSchema = z.object({
  ...blockBase,
  type: z.literal('imageText'),
  image: mediaReferenceSchema.nullish(),
  heading: z.string().min(1).max(200),
  body: z.string().max(4000),
  imageSide: z.enum(['left', 'right']),
});

export const cardGridBlockSchema = z.object({
  ...blockBase,
  type: z.literal('cardGrid'),
  heading: z.string().max(200).optional(),
  cards: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(120),
        description: z.string().max(2000),
        image: mediaReferenceSchema.nullish(),
      })
    )
    .max(12),
});

export const quoteBlockSchema = z.object({
  ...blockBase,
  type: z.literal('quote'),
  quote: z.string().min(1).max(2000),
  attribution: z.string().max(200).optional(),
});

export const ctaBlockSchema = z.object({
  ...blockBase,
  type: z.literal('cta'),
  heading: z.string().min(1).max(200),
  body: z.string().max(2000).optional(),
  buttonLabel: z.string().max(60).optional(),
  buttonUrl: z.string().max(400).optional(),
});

export const contentBlockSchema = z.discriminatedUnion('type', [
  heroBlockSchema,
  richTextBlockSchema,
  imageTextBlockSchema,
  cardGridBlockSchema,
  quoteBlockSchema,
  ctaBlockSchema,
]);

export const homeFieldsSchema = z.object({
  eyebrow: z.string().max(80),
  heading: z.string().min(1).max(200),
  mission: z.string().min(1).max(2000),
  heroImage: mediaReferenceSchema.nullish(),
  bottomLine: z.string().max(300),
});

export const aboutFocusAreaSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(2000),
  entity: z.string().max(200),
  abn: z.string().max(40),
});

export const aboutFieldsSchema = z.object({
  intro: z.string().min(1).max(2000),
  body: z.string().min(1).max(4000),
  focusAreas: z.array(aboutFocusAreaSchema).max(6),
});

export const contactFieldsSchema = z.object({
  location: z.string().min(1).max(200),
  email: z.string().email().max(200),
});

export const pageStatusSchema = z.enum(['draft', 'published', 'unpublished']);

export const pageWriteSchema = z.object({
  title: z.string().min(1, 'Title is required.').max(150),
  slug: slugSchema,
  navLabel: z.string().min(1).max(60),
  showInNavigation: z.boolean(),
  navOrder: z.number().int().min(0).max(9999),
  status: pageStatusSchema,
  seo: z.object({
    title: z.string().max(160).optional(),
    description: z.string().max(300).optional(),
  }),
  blocks: z.array(contentBlockSchema).max(30),
});

export const insightEntrySchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  slug: z.string().max(80).optional(),
  category: z.string().max(60).optional(),
  summary: z.string().min(1).max(2000),
  image: mediaReferenceSchema.nullish(),
  status: pageStatusSchema,
  order: z.number().int().min(0).max(9999),
  date: z.string().max(40).optional(),
});

export const loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});
