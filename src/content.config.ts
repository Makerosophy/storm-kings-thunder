import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      // Transform string to Date object
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
    }),
});

const sessions = defineCollection({
  loader: glob({ base: './src/content/sessions', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    sessionNumber: z.number(),
    cover: z.string().optional(),
    tags: z.array(z.string()).default([]),
    characters: z.array(z.string()).default([]),
    aiImages: z.boolean().default(true),
    summary: z.string().min(10),
    gallery: z.array(z.object({ src: z.string(), alt: z.string() })).default([]),
  }),
});

export const collections = { blog, sessions };
