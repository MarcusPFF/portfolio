import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://marcuspff.com/sitemap.xml',
    host: 'https://marcuspff.com',
  };
}
