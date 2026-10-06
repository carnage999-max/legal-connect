import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/ui/Reveal';

export function FinalCta() {
  return (
    <section className="dark-surface black-surface bg-black text-white">
      <div className="site-container section text-center">
        <Reveal>
          <h2 className="title-hero mx-auto max-w-4xl">Tell us what you need. Tell us once.</h2>
          <p className="lede mx-auto mt-6">Start your intake in a few minutes. You can go back and change any answer.</p>
          <div className="mt-9 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            <Link href="/intake" className="btn btn-primary btn-lg">
              Start Legal Intake
            </Link>
            <Link href="/attorneys/apply" className="link-arrow justify-center text-lg">
              For attorneys <span aria-hidden>›</span>
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <Image
            src="/potential-client-browsing-legal-connect.jpeg"
            alt="Over the shoulder of a woman using a laptop that shows the Legal Connect steps: describe, screen, match and connect."
            width={1672}
            height={941}
            sizes="(min-width: 640px) 420px, calc(100vw - 2.5rem)"
            className="mx-auto mt-16 h-auto w-full max-w-md rounded-3xl"
          />
        </Reveal>
      </div>
    </section>
  );
}
