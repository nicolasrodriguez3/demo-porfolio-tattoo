// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// Keystatic solo en desarrollo
/** @type {import('@keystatic/astro').default} */
let keystatic;
try {
  keystatic = (await import('@keystatic/astro')).default;
} catch {
  // Keystatic no disponible (producción sin dependencia)
}

// https://astro.build/config
export default defineConfig({
  site: 'https://carmin-tattoo.vercel.app',
  integrations: [
    react(),
    sitemap(),
    ...(process.env.NODE_ENV !== 'production' && keystatic
      ? [keystatic()]
      : []),
  ],
});
