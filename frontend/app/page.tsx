import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/home/Hero';
import { Problem } from '@/components/home/Problem';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Match } from '@/components/home/Match';
import { Conflicts } from '@/components/home/Conflicts';
import { Security } from '@/components/home/Security';
import { Attorneys } from '@/components/home/Attorneys';
import { Story } from '@/components/home/Story';
import { Faq } from '@/components/home/Faq';
import { FinalCta } from '@/components/home/FinalCta';

export default function Home(): React.ReactNode {
  return (
    <>
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
