import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

const isPrivatePage = (page) =>
  ['/404/', '/bag/'].some((path) => page.endsWith(path)) || /\/admin(login)?(\/|$)/.test(new URL(page).pathname);

export default defineConfig({
  site: 'https://royaleluxury.com',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'http', hostname: '127.0.0.1' },
    ],
  },
  vite: {
    build: {
      sourcemap: false,
    },
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  integrations: [
    react(),
    sitemap({
      filter: (page) => !isPrivatePage(page),
    }),
  ],
});
