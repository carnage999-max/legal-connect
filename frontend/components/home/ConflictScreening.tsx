import { EyeOff, ListChecks, ScanSearch, UserRoundCheck } from 'lucide-react';

const STEPS = [
  { icon: ListChecks, title: 'You list the parties', text: 'Everyone connected to the matter: people, businesses, opposing sides.' },
  { icon: EyeOff, title: 'Names are protected', text: 'Party names are converted to a protected form before they are compared.' },
  { icon: ScanSearch, title: 'Attorneys are screened', text: 'The protected names are checked against each attorney’s conflict data.' },
  { icon: UserRoundCheck, title: 'The attorney confirms', text: 'Before accepting, the attorney completes their own professional conflict review.' },
];

const RESULTS = [
  { label: 'Clear at platform level', tone: 'badge-green' },
  { label: 'Possible conflict', tone: 'badge-amber' },
  { label: 'Attorney review required', tone: 'badge-blue' },
  { label: 'More information needed', tone: '' },
];

export function ConflictScreening() {
  return (
    <section className="section bg-white">
      <div className="site-container">
        <div className="max-w-3xl">
          <p className="eyebrow">Conflict screening</p>
          <h2 className="title-1 mt-4">A conflict found before the call, not after it.</h2>
          <p className="lede mt-5">
            Screening removes the most common dead end in finding a lawyer. It is a first filter that saves everyone time.
          </p>
        </div>

        <ol className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="card relative p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <Icon size={22} />
              </span>
              <p className="mt-5 text-sm font-semibold text-blue-600">Step {i + 1}</p>
              <h3 className="title-3 mt-1">{title}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-mute">{text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-6 rounded-[22px] border border-hairline bg-paper p-6 sm:p-8 lg:grid-cols-[1fr_1fr] lg:gap-10">
          <div>
            <h3 className="title-3">What you may see</h3>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {RESULTS.map((r) => (
                <span key={r.label} className={`badge ${r.tone}`}>
                  {r.label}
                </span>
              ))}
            </div>
          </div>
          <p className="text-[0.97rem] leading-relaxed text-slate-600">
            <span className="font-semibold text-ink">What this is, and is not. </span>
            Platform screening assists the process. It does not replace an attorney’s own professional conflict review, and
            it never gives a legal conclusion.
          </p>
        </div>
      </div>
    </section>
  );
}
