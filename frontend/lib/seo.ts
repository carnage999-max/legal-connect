import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

/**
 * Builds a page's metadata with its Open Graph and Twitter cards filled in.
 * Next replaces (rather than merges) nested openGraph objects, so every page
 * that sets its own title has to carry the image and site name again.
 */
export function pageMetadata({
  title,
  description = SITE.description,
  path,
  index = true,
}: {
  title: string;
  description?: string;
  path: string;
  index?: boolean;
}): Metadata {
  const image = {
    url: SITE.ogImage.url,
    width: SITE.ogImage.width,
    height: SITE.ogImage.height,
    alt: 'Legal Connect: from a stressful search for a lawyer to a confirmed match with a qualified attorney.',
  };
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: index ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: 'website',
      siteName: SITE.name,
      locale: 'en_US',
      title: `${title} | ${SITE.name}`,
      description,
      url: path,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE.name}`,
      description,
      images: [image.url],
    },
  };
}
