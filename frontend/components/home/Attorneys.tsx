import Image from 'next/image';
import Link from 'next/link';
import { Clock, FileText, Lock, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';

const POINTS = [
  { icon: Clock, text: 'Spend less time on dead-end intake calls' },
  { icon: FileText, text: 'Receive structured matter information, ready to review' },
  { icon: SlidersHorizontal, text: 'Choose your practice areas, jurisdictions and availability' },
  { icon: ShieldCheck, text: 'Complete your own professional conflict review before accepting' },
  { icon: Lock, text: 'Communicate with clients securely' },
];

export function Attorneys() {
  return (
    <section id="for-attorneys" className="section bg-white">
      <div className="site-container">
        <Reveal className="tile tile-dark dark-surface black-surface grid gap-12 !p-[clamp(1.6rem,5vw,4.5rem)] lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16">
          <div>
            <h2 className="title-1">Matters that arrive screened and ready to review.</h2>
            <p className="lede mt-5">
              Legal Connect does the intake and the first conflict filter. You decide which matters to take.
            </p>
            <ul className="mt-9 divide-y divide-hairline border-y border-hairline">
              {POINTS.map((p) => (
                <li key={p.text} className="flex items-center gap-3.5 py-3.5 text-[1rem] text-ink">
                  <p.icon size={20} strokeWidth={1.75} className="flex-none text-mute" />
                  {p.text}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Image
              src="/attorney-with-client.jpeg"
              alt="An attorney in a navy suit speaking with a client across a desk, with a network of attorney profiles and the Legal Connect logo beside them."
              width={1672}
              height={941}
              sizes="(min-width: 1024px) 420px, calc(100vw - 4rem)"
              className="h-auto w-full max-w-md rounded-2xl lg:max-w-none"
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/attorneys/apply" className="btn btn-blue">
                Explore Legal Connect for Attorneys
              </Link>
              <Link href="/attorney/login" className="btn btn-outline">
                Attorney sign in
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
