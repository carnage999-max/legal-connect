import Image from 'next/image';
import { Check, FileText, Lock, MessageSquare, ShieldCheck, UserCheck } from 'lucide-react';

export const STAGES = [
  {
    key: 'describe',
    title: 'Describe',
    blurb: 'Tell us what is going on in plain language, once. We ask only for what matching needs.',
    pill: 'Intake',
  },
  {
    key: 'screen',
    title: 'Screen',
    blurb: 'Party names are protected, then screened against attorneys. A conflict is caught before anyone is contacted.',
    pill: 'Screening',
  },
  {
    key: 'match',
    title: 'Match',
    blurb: 'You see attorneys who cover your jurisdiction and practice area, with their availability.',
    pill: 'Matched',
  },
  {
    key: 'connect',
    title: 'Connect',
    blurb: 'A secure conversation opens with the attorney you choose. No second intake, no repeating yourself.',
    pill: 'Connected',
  },
] as const;

export type StageIndex = 0 | 1 | 2 | 3;

function Row({ done, active, children }: { done?: boolean; active?: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 text-[0.93rem]">
      <span
        className={`grid h-6 w-6 flex-none place-items-center rounded-full ${
          done ? 'bg-green-500 text-navy-950' : active ? 'pulse-ring bg-green-500/20 ring-1 ring-green-400' : 'bg-white/10'
        }`}
      >
        {done && <Check size={14} strokeWidth={3} />}
      </span>
      <span className={done || active ? 'text-white' : 'text-slate-500'}>{children}</span>
    </li>
  );
}

function Describe() {
  return (
    <div className="rise-in space-y-4" key="describe">
      <div>
        <p className="text-xs font-medium text-slate-400">What do you need help with?</p>
        <div className="mt-2 rounded-xl border border-white/10 bg-navy-900 p-3.5 text-[0.95rem] leading-relaxed text-slate-100">
          My landlord has kept my security deposit and stopped replying to my messages. I need an attorney who handles
          tenant disputes.
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-white/10 bg-navy-900 p-3">
          <p className="text-xs text-slate-400">Matter type</p>
          <p className="mt-0.5 font-semibold text-white">Civil</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-navy-900 p-3">
          <p className="text-xs text-slate-400">Jurisdiction</p>
          <p className="mt-0.5 font-semibold text-white">State</p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-blue-500/10 p-3 text-[0.85rem] text-blue-100">
        <FileText size={16} className="flex-none text-blue-400" />
        Step 2 of 5. You can go back and change any answer.
      </div>
    </div>
  );
}

function Screen() {
  return (
    <div className="rise-in space-y-4" key="screen">
      <ul className="space-y-3.5">
        <Row done>Party names protected before screening</Row>
        <Row done>Checked against attorney conflict lists</Row>
        <Row active>Confirming availability</Row>
      </ul>
      <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-3.5">
        <div className="flex items-center gap-2 text-sm font-semibold text-green-300">
          <ShieldCheck size={17} /> Clear at platform level
        </div>
        <p className="mt-1.5 text-[0.85rem] leading-relaxed text-slate-300">
          Platform screening assists the process. Each attorney still completes their own professional conflict review.
        </p>
      </div>
    </div>
  );
}

function Match() {
  const rows = [
    { initials: 'MA', name: 'M. Alvarez', focus: 'Landlord and tenant', where: 'State', status: 'Available today', tone: 'green' },
    { initials: 'JO', name: 'J. Okafor', focus: 'Civil disputes', where: 'State and federal', status: 'Replies within 24 hours', tone: 'blue' },
  ] as const;
  return (
    <div className="rise-in space-y-3" key="match">
      {rows.map((r) => (
        <div key={r.name} className="rounded-xl border border-white/10 bg-navy-900 p-3.5">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-gradient-to-br from-blue-600 to-green-600 text-xs font-bold text-white">
              {r.initials}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="font-semibold text-white">{r.name}</p>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-300">
                  <UserCheck size={13} /> License verified
                </span>
              </div>
              <p className="text-[0.85rem] text-slate-400">
                {r.focus} · {r.where}
              </p>
              <p className={`mt-1 text-xs font-medium ${r.tone === 'green' ? 'text-green-300' : 'text-blue-300'}`}>{r.status}</p>
            </div>
          </div>
        </div>
      ))}
      <p className="px-1 text-xs text-slate-500">Example results. Real matches depend on your matter and jurisdiction.</p>
    </div>
  );
}

function Connect() {
  return (
    <div className="rise-in space-y-3" key="connect">
      <div className="flex items-center gap-2 text-sm font-semibold text-green-300">
        <Lock size={15} /> Secure conversation opened
      </div>
      <div className="space-y-2.5 text-[0.9rem] leading-relaxed">
        <div className="ml-auto w-fit max-w-[88%] rounded-2xl rounded-br-md bg-blue-600 px-3.5 py-2.5 text-white">
          Hello, I would like to talk about my deposit dispute.
        </div>
        <div className="w-fit max-w-[88%] rounded-2xl rounded-bl-md bg-navy-700 px-3.5 py-2.5 text-slate-100">
          Thanks for reaching out. I have read your summary and can speak this week.
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-white/5 p-3 text-[0.85rem] text-slate-300">
        <MessageSquare size={16} className="flex-none text-blue-400" />
        No second intake needed.
      </div>
    </div>
  );
}

/**
 * The product, shown rather than described. Used in the hero (it plays through
 * the four stages on its own) and in "How it works" (the visitor picks one).
 */
export function ProductPanel({ stage }: { stage: StageIndex }) {
  return (
    <div className="dark-surface overflow-hidden rounded-[22px] border border-white/10 bg-navy-800 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.6)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <Image src="/logo.jpeg" alt="" width={28} height={28} className="rounded-md" />
          <span className="truncate text-sm font-semibold text-white">Your matter</span>
        </div>
        <span className="badge badge-green" aria-live="polite">
          {STAGES[stage].pill}
        </span>
      </div>

      <div className="min-h-[300px] p-4 sm:p-5">
        {stage === 0 && <Describe />}
        {stage === 1 && <Screen />}
        {stage === 2 && <Match />}
        {stage === 3 && <Connect />}
      </div>

      <div className="grid grid-cols-4 gap-1.5 px-4 pb-4 sm:px-5 sm:pb-5" aria-hidden>
        {STAGES.map((s, i) => (
          <span key={s.key} className={`h-1 rounded-full ${i <= stage ? 'bg-green-500' : 'bg-white/10'}`} />
        ))}
      </div>
    </div>
  );
}
