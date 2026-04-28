import type { MetadataRoute } from 'next';
import { trips } from '@/lib/trips';
import { classes } from '@/lib/data';

const BASE = 'https://marcuspff.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, priority: 1.0, changeFrequency: 'monthly' },
    { url: `${BASE}/llm`, lastModified: now, priority: 0.8, changeFrequency: 'monthly' },
    { url: `${BASE}/trips`, lastModified: now, priority: 0.8, changeFrequency: 'monthly' },
  ];

  const tripRoutes: MetadataRoute.Sitemap = trips.map((t) => ({
    url: `${BASE}/trips/${t.slug}`,
    lastModified: now,
    priority: 0.6,
    changeFrequency: 'yearly',
  }));

  const blogRoutes: MetadataRoute.Sitemap = classes
    .filter((c) => !!c.blogSlug && !c.hidden)
    .map((c) => ({
      url: `${BASE}/llm/${c.blogSlug}/blog`,
      lastModified: now,
      priority: 0.6,
      changeFrequency: 'monthly',
    }));

  return [...staticRoutes, ...tripRoutes, ...blogRoutes];
}
