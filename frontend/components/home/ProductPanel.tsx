import Image from 'next/image';
import { Check } from 'lucide-react';

export const STAGES = [
  {
    key: 'describe',
    title: 'Describe',
    blurb: 'Tell us what is going on in plain language, once. We ask only for what matching needs.',
  },
  {
    key: 'screen',
    title: 'Screen',
    blurb: 'Party names are protected, then screened against attorneys. A conflict is caught before anyone is contacted.',
  },
  {
    key: 'match',
    title: 'Match',
    blurb: 'You see attorneys who cover your jurisdiction and practice area, with their availability.',
  },
  {
    key: 'connect',
    title: 'Connect',
    blurb: 'A secure conversation opens with the attorney you choose. No second intake, no repeating yourself.',
  },
] as const;

export type StageIndex = 0 | 1 | 2 | 3;

const row = (i: number) => ({ '--d': `${0.12 + i * 0.22}s` }) as React.CSSProperties;

function Describe() {
  return (
    <div className="space-y-6">
      <div className="tick-in" style={row(0)}>
        <p className="text-[0.8rem] text-[#a1a1a6]">What do you need help with?</p>
        <p className="mt-2 rounded-2xl bg-[#2c2c2e] p-4 text-[1rem] leading-relaxed text-[#f5f5f7]">
          My landlord has kept my security deposit and stopped replying to my messages. I need an attorney who handles tenant disputes.
        </p>
      </div>
      <dl className="tick-in grid grid-cols-2 gap-6 border-t border-[#2c2c2e] pt-5 text-sm" style={row(1)}>
        <div>
          <dt className="text-[#a1a1a6]">Matter type</dt>
          <dd className="mt-1 text-base font-semibold text-[#f5f5f7]">Civil</dd>
        </div>
        <div>
          <dt className="text-[#a1a1a6]">Jurisdiction</dt>
          <dd className="mt-1 text-base font-semibold text-[#f5f5f7]">State</dd>
        </div>
      </dl>
    </div>
  );
}

function Screen() {
  const lines = ['Party names protected', 'Checked against attorney conflict lists', 'Availability confirmed'];
  return (
    <div className="space-y-6">
      <ul className="space-y-4">
        {lines.map((l, i) => (
          <li key={l} className="tick-in flex items-center gap-3 text-[1rem] text-[#f5f5f7]" style={row(i)}>
            <Check size={18} strokeWidth={2.5} className="flex-none text-[#5bd16e]" />
            {l}
          </li>
        ))}
      </ul>
      <div className="tick-in border-t border-[#2c2c2e] pt-5" style={row(3)}>
        <p className="text-base font-semibold text-[#5bd16e]">Clear at platform level</p>
        <p className="mt-1 text-sm leading-relaxed text-[#a1a1a6]">
          Screening assists the process. Each attorney still completes their own professional conflict review.
        </p>
      </div>
    </div>
  );
}

function Match() {
  const rows = [
    { name: 'Sarah Mitchell', focus: 'Landlord and tenant law · State', note: 'Available today' },
    { name: 'David Carter', focus: 'Civil disputes · State and federal', note: 'Replies within 24 hours' },
  ];
  return (
    <div>
      <ul className="divide-y divide-[#2c2c2e]">
        {rows.map((r, i) => (
          <li key={r.name} className="tick-in py-5 first:pt-0" style={row(i)}>
            <p className="text-lg font-semibold text-[#f5f5f7]">{r.name}</p>
            <p className="mt-0.5 text-sm text-[#a1a1a6]">{r.focus}</p>
            <p className="mt-2 text-sm font-medium text-[#5bd16e]">{r.note}</p>
          </li>
        ))}
      </ul>
      <p className="tick-in mt-2 text-xs text-[#6e6e73]" style={row(2)}>
        Example results. Real matches depend on your matter and jurisdiction.
      </p>
    </div>
  );
}

function Connect() {
  return (
    <div className="space-y-4">
      <p className="tick-in text-[0.8rem] text-[#a1a1a6]" style={row(0)}>
        Secure conversation
      </p>
      <div className="space-y-3 text-[0.97rem] leading-relaxed">
        <div className="tick-in ml-auto w-fit max-w-[88%] rounded-3xl rounded-br-lg bg-[#0a84ff] px-4 py-3 text-white" style={row(1)}>
          Hello, I would like to talk about my deposit dispute.
        </div>
        <div className="tick-in w-fit max-w-[88%] rounded-3xl rounded-bl-lg bg-[#2c2c2e] px-4 py-3 text-[#f5f5f7]" style={row(2)}>
          Thanks for reaching out. I read your summary and can talk this week.
        </div>
      </div>
      <p className="tick-in pt-2 text-sm text-[#a1a1a6]" style={row(3)}>
        No second intake needed.
      </p>
    </div>
  );
}

/**
 * The product, shown rather than described. Used in the hero (it plays through
 * the four stages on its own) and in "How it works" (it follows the scroll).
 */
export function ProductPanel({ stage }: { stage: StageIndex }) {
  return (
    <div className="black-surface dark-surface overflow-hidden rounded-[28px] bg-[#1c1c1e] p-6 text-[#f5f5f7] sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.jpeg" alt="" width={28} height={28} className="rounded-md" />
          <span className="text-sm font-semibold">Your matter</span>
        </div>
        <span className="text-sm text-[#a1a1a6]" aria-live="polite">
          {STAGES[stage].title}
        </span>
      </div>

      <div key={stage} className="min-h-[250px] pt-7">
        {stage === 0 && <Describe />}
        {stage === 1 && <Screen />}
        {stage === 2 && <Match />}
        {stage === 3 && <Connect />}
      </div>

      <div className="grid grid-cols-4 gap-1.5" aria-hidden>
        {STAGES.map((s, i) => (
          <span key={s.key} className={`h-[3px] rounded-full transition-colors duration-500 ${i <= stage ? 'bg-[#f5f5f7]' : 'bg-[#3a3a3c]'}`} />
        ))}
      </div>
    </div>
  );
}
