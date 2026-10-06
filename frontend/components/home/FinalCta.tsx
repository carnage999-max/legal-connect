import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';

export function FinalCta() {
  return (
    <section className="dark-surface black-surface bg-black text-white">
      <div className="site-container section text-center">
        <Reveal>
          <h2 className="title-hero mx-auto max-w-4xl">Tell us what you need. Tell us once.</h2>
          <p className="lede mx-auto mt-6">Start your intake in a few minutes. You can go back and change any answer.</p>
          <div className="mt-9 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            <Link href="/intake" className="btn btn-primary btn-lg group">
              Start Legal Intake
              <ArrowRight size={19} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/attorneys/apply" className="link-arrow justify-center text-lg">
              For attorneys <span aria-hidden>›</span>
            </Link>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
