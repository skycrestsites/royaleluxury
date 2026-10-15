import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const excludedFromSitemap = ['/404/', '/bag/', '/collections/', '/products/'];

export default defineConfig({
  site: 'https://royaleluxury.com',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  redirects: {
    '/collections': '/shop/',
    '/products': '/shop/',
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  integrations: [
    sitemap({
      filter: (page) => !excludedFromSitemap.some((path) => page.endsWith(path)),
    }),
  ],
});
