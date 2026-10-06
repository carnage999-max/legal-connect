import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/home/Hero';
import { Problem } from '@/components/home/Problem';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Match } from '@/components/home/Match';
import { Conflicts } from '@/components/home/Conflicts';
import { Security } from '@/components/home/Security';
import { Attorneys } from '@/components/home/Attorneys';
import { Story } from '@/components/home/Story';
import { Faq, FAQS } from '@/components/home/Faq';
import { FinalCta } from '@/components/home/FinalCta';
import { SITE } from '@/lib/site';

// The layout supplies the default title, description and Open Graph card for the home page.
export const metadata: Metadata = { alternates: { canonical: '/' } };

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}${SITE.logo}`,
    description: SITE.description,
    address: { '@type': 'PostalAddress', ...SITE.address },
    telephone: SITE.telephone,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  },
];

export default function Home(): React.ReactNode {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Navbar overlay />
      <Hero />
      <Problem />
      <HowItWorks />
      <Match />
      <Conflicts />
      <Security />
      <Attorneys />
      <Story />
      <Faq />
      <FinalCta />
    </>
  );
}
