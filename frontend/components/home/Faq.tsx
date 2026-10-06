import Image from 'next/image';
import { Plus } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';

export const FAQS = [
  {
    q: 'What does it cost me to use Legal Connect?',
    a: 'Describing your matter and getting matched happens on the platform. Any legal fees are agreed directly between you and the attorney you choose, so ask about fees before you engage them.',
  },
  {
    q: 'Does using Legal Connect make someone my attorney?',
    a: 'No. Legal Connect is a technology platform, not a law firm. An attorney-client relationship begins only when an attorney accepts your matter and you both agree to work together.',
  },
  {
    q: 'How do conflict checks work?',
    a: 'Party names are protected and screened against attorneys before anyone is contacted. This assists the process, and every attorney still completes their own professional conflict review.',
  },
  {
    q: 'Who can see my information?',
    a: 'Only the people who need it, at the stage they need it. We ask for what matching requires and we do not sell your information.',
  },
  {
    q: 'How are attorneys qualified?',
    a: 'Attorneys apply with their bar license and jurisdiction, and are reviewed before joining. They choose the practice areas and states they cover.',
  },
  {
    q: 'Which jurisdictions are covered?',
    a: 'You choose state or federal at intake. You are matched with attorneys who cover that jurisdiction.',
  },
  {
    q: 'How fast will an attorney respond?',
    a: 'Attorneys are asked to respond to a referral within 24 hours. Each result shows the attorney’s availability so you know what to expect.',
  },
  {
    q: 'What if no attorney is available?',
    a: 'You will be told plainly, instead of being left at a dead end. You can adjust your details and try again.',
  },
];

export function Faq() {
  return (
    <section id="faq" className="section bg-white">
      <div className="site-container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal>
          <h2 className="title-1">Common questions.</h2>
          <Image
            src="/potential-client-browsing-legal-connect.jpeg"
            alt="Over the shoulder of a woman using a laptop that shows the Legal Connect steps: describe, screen, match and connect."
            width={1672}
            height={941}
            sizes="320px"
            className="mt-10 h-auto w-full max-w-[320px] rounded-3xl"
          />
        </Reveal>

        <Reveal className="border-b border-hairline" delay={0.08}>
          {FAQS.map((f) => (
            <details key={f.q} className="group border-t border-hairline">
              <summary className="flex min-h-[68px] cursor-pointer items-center justify-between gap-6 py-4 text-left text-[1.1rem] font-semibold tracking-tight text-ink">
                {f.q}
                <Plus size={22} strokeWidth={1.75} className="flex-none text-mute transition-transform duration-300 group-open:rotate-45" />
              </summary>
              <p className="pb-6 pr-10 text-[1rem] leading-relaxed text-mute">{f.a}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
