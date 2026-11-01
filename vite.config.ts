import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: { target: 'es2022' },
  plugins: [
    VitePWA({
      // 'prompt': a waiting worker is never activated until the user asks, so no mid-use or crisis reloads.
      registerType: 'prompt',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'Ready',
        short_name: 'Ready',
        description: 'Household preparedness that works offline. Your data stays on your device.',
        lang: 'en-GB',
        start_url: './',
        scope: './',
        display: 'standalone',
        theme_color: '#0a111a',
        background_color: '#0a111a',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,woff,png,svg,json,webmanifest}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
  test: { include: ['src/**/*.test.ts'] },
});
