import { Reveal } from '@/components/ui/Reveal';

const STEPS = [
  { title: 'You list the parties', text: 'Everyone connected to the matter: people, businesses, opposing sides.' },
  { title: 'Names are protected', text: 'Party names are converted to a protected form before they are compared.' },
  { title: 'Attorneys are screened', text: 'The protected names are checked against each attorney’s conflict data.' },
  { title: 'The attorney confirms', text: 'Before accepting, the attorney completes their own professional conflict review.' },
];

const RESULTS = ['Clear at platform level', 'Possible conflict', 'Attorney review required', 'More information needed'];

export function Conflicts() {
  return (
    <section className="dark-surface black-surface section bg-black text-white">
      <div className="site-container">
        <Reveal>
          <h2 className="title-1 max-w-3xl">A conflict found before the call, not after it.</h2>
          <p className="lede mt-6">
            Screening removes the most common dead end in finding a lawyer. It is a first filter that saves everyone time.
          </p>
        </Reveal>

        <ol className="mt-20 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 0.08}>
              <span className="tnum block text-6xl font-semibold tracking-tighter text-white/20">{i + 1}</span>
              <h3 className="mt-5 text-xl font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-2.5 text-[0.97rem] leading-relaxed text-[#a1a1a6]">{s.text}</p>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-20 grid gap-8 border-t border-[#2c2c2e] pt-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h3 className="font-semibold">What you may see</h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-[0.97rem] text-[#a1a1a6]">
              {RESULTS.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <p className="text-[1rem] leading-relaxed text-[#a1a1a6]">
            <span className="font-semibold text-white">What this is, and is not. </span>
            Platform screening assists the process. It does not replace an attorney’s own professional conflict review, and it never gives a legal conclusion.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
