import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/ui/Reveal';

const POINTS = [
  'Spend less time on dead-end intake calls',
  'Receive structured matter information, ready to review',
  'Choose your practice areas, jurisdictions and availability',
  'Complete your own professional conflict review before accepting',
  'Communicate with clients securely',
];

export function Attorneys() {
  return (
    <section id="for-attorneys" className="section bg-white">
      <div className="site-container">
        <Reveal className="tile tile-dark dark-surface black-surface grid items-center gap-12 !p-[clamp(1.6rem,5vw,4.5rem)] lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <h2 className="title-1">Matters that arrive screened and ready to review.</h2>
            <p className="lede mt-5">
              Legal Connect does the intake and the first conflict filter. You decide which matters to take.
            </p>
            <ul className="mt-9 divide-y divide-hairline border-y border-hairline">
              {POINTS.map((p) => (
                <li key={p} className="py-3.5 text-[1rem] text-ink">
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
              <Link href="/attorneys/apply" className="btn btn-blue btn-lg">
                Explore Legal Connect for Attorneys
              </Link>
              <Link href="/attorney/login" className="link-arrow justify-center text-lg">
                Attorney sign in <span aria-hidden>›</span>
              </Link>
            </div>
          </div>

          <Image
            src="/attorney-with-client.jpeg"
            alt="An attorney in a navy suit speaking with a client across a desk, with a network of attorney profiles and the Legal Connect logo beside them."
            width={1672}
            height={941}
            sizes="(min-width: 1024px) 420px, calc(100vw - 4rem)"
            className="h-auto w-full max-w-md rounded-2xl lg:max-w-none"
          />
        </Reveal>
      </div>
    </section>
  );
}
