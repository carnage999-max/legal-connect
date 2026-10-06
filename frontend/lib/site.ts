/** One place for the facts every page, tag and feed repeats. */
export const SITE = {
  name: 'Legal Connect',
  url: 'https://legalconnectapp.com',
  tagline: 'Describe your legal issue once. We find the attorney.',
  description:
    'Describe your legal issue once. Legal Connect screens for conflicts, finds available attorneys in your jurisdiction and opens a secure conversation.',
  ogImage: { url: '/problem-to-solution-woman.jpeg', width: 1672, height: 941 },
  logo: '/logo.jpeg',
  address: {
    streetAddress: 'PO Box 52',
    addressLocality: 'Detroit',
    addressRegion: 'ME',
    postalCode: '04929',
    addressCountry: 'US',
  },
  telephone: '+1-207-947-1999',
} as const;

/** Social profiles. The links are placeholders until the real profile URLs exist. */
export const SOCIALS = [
  { key: 'youtube', name: 'YouTube', href: 'https://www.youtube.com' },
  { key: 'rumble', name: 'Rumble', href: 'https://rumble.com' },
  { key: 'liberty', name: 'Liberty Social', href: 'https://libertysocial.com' },
  { key: 'facebook', name: 'Facebook', href: 'https://www.facebook.com' },
  { key: 'x', name: 'X', href: 'https://x.com' },
  { key: 'instagram', name: 'Instagram', href: 'https://www.instagram.com' },
  { key: 'tiktok', name: 'TikTok', href: 'https://www.tiktok.com' },
  { key: 'yelp', name: 'Yelp', href: 'https://www.yelp.com' },
  { key: 'truth', name: 'Truth Social', href: 'https://truthsocial.com' },
  { key: 'threads', name: 'Threads', href: 'https://www.threads.net' },
] as const;
