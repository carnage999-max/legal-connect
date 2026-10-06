import { Reveal } from '@/components/ui/Reveal';

const POINTS = [
  'License and verification status on every profile',
  'Practice focus and the jurisdictions they cover',
  'Availability and how quickly they respond',
  'A plain reason for why each attorney is shown',
];

const ATTORNEYS = [
  {
    name: 'Sarah Mitchell',
    focus: 'Landlord and tenant law',
    where: 'Licensed in your state',
    note: 'Available to take a new matter',
    why: 'Covers your state, practices tenant law and has no platform-level conflict.',
  },
  {
    name: 'David Carter',
    focus: 'Civil disputes and contracts',
    where: 'State and federal',
    note: 'Replies within 24 hours',
    why: 'Covers your state and handles civil matters of this kind.',
  },
];

export function Match() {
  return (
    <section className="section bg-white">
      <div className="site-container">
        <Reveal className="tile grid items-center gap-12 !p-[clamp(1.6rem,5vw,4.5rem)] lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <h2 className="title-1">Results built from your matter, not a directory.</h2>
            <p className="lede mt-5">
              After screening, you see attorneys who fit your jurisdiction and practice area, and who can take your matter now.
            </p>
            <ul className="mt-9 divide-y divide-hairline border-y border-hairline">
              {POINTS.map((p) => (
                <li key={p} className="py-3.5 text-[1rem] text-ink">
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            {ATTORNEYS.map((a, i) => (
              <Reveal key={a.name} delay={0.1 + i * 0.1} className="rounded-3xl bg-white p-6 sm:p-7">
                <p className="text-xl font-semibold tracking-tight">{a.name}</p>
                <p className="mt-0.5 text-[0.97rem] text-mute">
                  {a.focus}, {a.where}
                </p>
                <p className="mt-3 text-[0.97rem] font-medium text-green-700">{a.note}</p>
                <p className="mt-4 border-t border-hairline pt-4 text-[0.9rem] leading-relaxed text-mute">
                  <span className="font-semibold text-ink">Why you see this attorney. </span>
                  {a.why}
                </p>
              </Reveal>
            ))}
            <p className="px-1 text-[0.85rem] text-mute">Illustrative profiles. Your results come from real attorneys on the platform.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
