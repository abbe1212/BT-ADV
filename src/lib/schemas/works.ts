import { z } from 'zod';

// ─── Works form schema ────────────────────────────────────────────────────────

export const WORK_CATEGORIES = [
  'TV Commercial',
  'Digital Ad',
  'Music Video',
  'Reel Campaign',
] as const;

export type WorkCategory = (typeof WORK_CATEGORIES)[number];

// Zod v4: z.enum() accepts a plain record or a literal union — use z.union of z.literal() for const tuple
const categoryLiterals = WORK_CATEGORIES.map((c) => z.literal(c)) as [
  z.ZodLiteral<'TV Commercial'>,
  z.ZodLiteral<'Digital Ad'>,
  z.ZodLiteral<'Music Video'>,
  z.ZodLiteral<'Reel Campaign'>,
];
const categorySchema = z.union(categoryLiterals);

export const workSchema = z.object({
  title_en: z
    .string()
    .max(200, 'English title must be under 200 characters')
    .optional()
    .or(z.literal('')),

  title_ar: z
    .string()
    .min(1, 'Arabic title is required')
    .max(200, 'Arabic title must be under 200 characters'),

  category: categorySchema,

  image_url: z
    .string()
    .min(1, 'Image is required')
    .url('Must be a valid URL'),

  video_url: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),

  year: z
    .number()
    .int()
    .min(2000, 'Year must be 2000 or later')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the far future'),

  order_index: z
    .number()
    .int()
    .min(0, 'Order must be 0 or more'),

  featured: z.boolean(),
});

export type WorkFormValues = z.infer<typeof workSchema>;

export const defaultWorkValues: WorkFormValues = {
  title_en: '',
  title_ar: '',
  category: 'TV Commercial',
  image_url: '',
  video_url: '',
  year: new Date().getFullYear(),
  order_index: 0,
  featured: false,
};
