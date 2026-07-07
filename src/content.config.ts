import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const artists = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/artists' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    photo: z.string(),
    bio: z.string(),
    styles: z.array(z.string()),
    social: z.object({
      instagram: z.string().optional(),
      email: z.string().optional(),
    }).optional(),
    portfolioImages: z.array(z.string()).optional(),
    published: z.boolean().default(true),
  }),
});

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/gallery' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    image: z.string(),
    description: z.string().optional(),
    styles: z.array(z.string()),
    artist: z.string(),
    width: z.number().optional(),
    height: z.number().optional(),
    featured: z.boolean().default(false),
    published: z.boolean().default(true),
  }),
});

const siteSettings = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/settings' }),
  schema: z.object({
    studioName: z.string(),
    address: z.string(),
    phone: z.string().optional(),
    email: z.string(),
    socialLinks: z.object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
    }),
    homeHeroTitle: z.string(),
    homeHeroDescription: z.string(),
    schedule: z.string().optional(),
  }),
});

export const collections = { artists, gallery, siteSettings };
