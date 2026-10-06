import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

const POINTS = [
  'Spend less time on dead-end intake calls',
  'Receive structured matter information, ready to review',
  'Choose your practice areas, jurisdictions and availability',
  'Complete your own professional conflict review before accepting',
  'Communicate with clients securely',
];

export function ForAttorneys() {
  return (
    <section id="for-attorneys" className="section bg-blue-50">
      <div className="site-container grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <div>
          <p className="eyebrow">For attorneys</p>
          <h2 className="title-1 mt-4">Matters that arrive screened, structured and ready to review.</h2>
          <p className="lede mt-5">
            Legal Connect does the intake and the first conflict filter. You decide which matters to take, and you stay in
            control of your caseload.
          </p>

          <ul className="mt-8 space-y-3.5">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[1.02rem] text-slate-700">
                <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-blue-600 text-white">
                  <Check size={14} strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/attorneys/apply" className="btn btn-blue btn-lg group">
              Explore Legal Connect for Attorneys
              <ArrowRight size={19} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/attorney/login" className="btn btn-outline btn-lg">
              Attorney sign in
            </Link>
          </div>
        </div>

        <figure>
          <Image
            src="/attorney-with-client.jpeg"
            alt="An attorney in a navy suit speaking with a client across a desk. Beside them, a network of connected attorney profile photos with the Legal Connect logo above."
            width={1672}
            height={941}
            sizes="(min-width: 1280px) 620px, (min-width: 1024px) 50vw, calc(100vw - 2.5rem)"
            className="h-auto w-full rounded-[22px] shadow-[0_30px_70px_-30px_rgb(16_24_40/0.5)]"
          />
        </figure>
      </div>
    </section>
  );
}
