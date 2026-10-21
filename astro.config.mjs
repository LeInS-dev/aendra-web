import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.aendra.lat',
  trailingSlash: 'never',
  build: { format: 'directory' },
  integrations: [sitemap({ filter: (page) => !page.includes('/mi-moodboard') })],
});
