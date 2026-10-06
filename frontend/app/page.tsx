import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/home/Hero';
import { ProofStrip } from '@/components/home/ProofStrip';
import { Problem } from '@/components/home/Problem';
import { HowItWorks } from '@/components/home/HowItWorks';
import { MatchExperience } from '@/components/home/MatchExperience';
import { ConflictScreening } from '@/components/home/ConflictScreening';
import { Security } from '@/components/home/Security';
import { ForAttorneys } from '@/components/home/ForAttorneys';
import { Story } from '@/components/home/Story';
import { Faq } from '@/components/home/Faq';
import { FinalCta } from '@/components/home/FinalCta';

export default function Home(): React.ReactNode {
  return (
    <>
      <Navbar overlay />
      <Hero />
      <ProofStrip />
      <Problem />
      <HowItWorks />
      <MatchExperience />
      <ConflictScreening />
      <Security />
      <ForAttorneys />
      <Story />
      <Faq />
      <FinalCta />
    </>
  );
}
