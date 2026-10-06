import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

const PAGES: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' | 'yearly' }[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/intake', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/attorneys/apply', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/signup', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/login', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/attorney/login', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/delete-account', priority: 0.2, changeFrequency: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PAGES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE.url}${path === '/' ? '' : path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
