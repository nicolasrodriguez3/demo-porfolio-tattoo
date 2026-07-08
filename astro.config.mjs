// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';
import keystatic from '@keystatic/astro';
import markdoc from '@astrojs/markdoc';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://tattoo-studio.vercel.app',
  output: 'static',

  adapter: node({
    mode: 'standalone',
  }),

  integrations: [react(), sitemap(), keystatic(), markdoc()],

  vite: {
    plugins: [tailwindcss()]
  }
});