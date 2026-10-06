import { Plus } from 'lucide-react';

const FAQS = [
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
    a: 'You will be told plainly, instead of being left on a dead end. You can adjust your details and try again.',
  },
];

export function Faq() {
  return (
    <section id="faq" className="section bg-paper">
      <div className="site-container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <p className="eyebrow">Common questions</p>
          <h2 className="title-1 mt-4">Straight answers before you start.</h2>
        </div>

        <div className="divide-y divide-hairline overflow-hidden rounded-[20px] border border-hairline bg-white">
          {FAQS.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex min-h-[64px] cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left text-[1.02rem] font-semibold text-ink hover:bg-paper sm:px-6">
                {f.q}
                <Plus size={20} className="flex-none text-blue-600 transition-transform group-open:rotate-45" />
              </summary>
              <p className="px-5 pb-5 text-[0.98rem] leading-relaxed text-mute sm:px-6">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
