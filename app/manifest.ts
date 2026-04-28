import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Marcus Forsberg',
    short_name: 'Marcus',
    description: 'Marcus Forsberg — Fullstack Developer & Adventurer',
    start_url: '/',
    display: 'standalone',
    background_color: '#f0e6e4',
    theme_color: '#0f172a',
    icons: [
      { src: '/icon', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
