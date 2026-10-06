import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FinalCta() {
  return (
    <section className="dark-surface hero-bg text-white">
      <div className="site-container grid items-center gap-12 py-20 md:py-28 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <div>
          <h2 className="title-1">Tell us what you need. Tell us once.</h2>
          <p className="lede mt-5">Start your intake in a few minutes. You can go back and change any answer.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/intake" className="btn btn-primary btn-lg group">
              Start Legal Intake
              <ArrowRight size={19} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/attorneys/apply" className="btn btn-outline btn-lg">
              For attorneys
            </Link>
          </div>
        </div>

        <figure>
          <Image
            src="/potential-client-browsing-legal-connect.jpeg"
            alt="Over the shoulder of a woman using a laptop that shows the Legal Connect steps: describe, screen, match and connect, with a Get Legal Help Now button. Attorney profile photos are linked above."
            width={1672}
            height={941}
            sizes="(min-width: 1280px) 620px, (min-width: 1024px) 50vw, calc(100vw - 2.5rem)"
            className="h-auto w-full rounded-[22px] ring-1 ring-white/10 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7)]"
          />
        </figure>
      </div>
    </section>
  );
}
