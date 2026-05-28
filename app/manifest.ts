import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Marcus Forsberg',
    short_name: 'Marcus',
    description: 'Marcus Forsberg — Fullstack Developer & Adventurer',
    start_url: '/',
    display: 'standalone',
    background_color: '#1a1822',
    theme_color: '#dc8a4a',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
