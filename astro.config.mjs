// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

const site = process.env.SITE;

// https://astro.build/config
export default defineConfig({
	site,
	base: process.env.BASE || '/',
	integrations: [mdx(), ...(site ? [sitemap()] : [])],
});
