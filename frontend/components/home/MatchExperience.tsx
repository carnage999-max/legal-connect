import { Clock, Globe2, MapPin, ShieldCheck, UserCheck } from 'lucide-react';

const POINTS = [
  'License and verification state on every profile',
  'Practice focus and the jurisdictions they cover',
  'Availability and how quickly they respond',
  'A plain reason for why each attorney is shown',
];

function Card({
  initials,
  name,
  focus,
  where,
  avail,
  reply,
  why,
}: {
  initials: string;
  name: string;
  focus: string;
  where: string;
  avail: string;
  reply: string;
  why: string;
}) {
  return (
    <article className="card p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 flex-none place-items-center rounded-full bg-gradient-to-br from-blue-600 to-green-600 text-sm font-bold text-white">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-ink">{name}</h3>
            <span className="badge badge-green">
              <UserCheck size={13} /> License verified
            </span>
          </div>
          <p className="mt-0.5 text-[0.95rem] text-mute">{focus}</p>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 text-[0.92rem] sm:grid-cols-2">
        <div className="flex items-center gap-2.5 text-slate-700">
          <MapPin size={17} className="flex-none text-blue-600" />
          <dt className="sr-only">Jurisdiction</dt>
          <dd>{where}</dd>
        </div>
        <div className="flex items-center gap-2.5 text-slate-700">
          <Clock size={17} className="flex-none text-blue-600" />
          <dt className="sr-only">Availability</dt>
          <dd>{avail}</dd>
        </div>
        <div className="flex items-center gap-2.5 text-slate-700 sm:col-span-2">
          <Globe2 size={17} className="flex-none text-blue-600" />
          <dt className="sr-only">Response</dt>
          <dd>{reply}</dd>
        </div>
      </dl>

      <p className="mt-4 rounded-xl bg-paper px-3.5 py-3 text-[0.88rem] leading-relaxed text-slate-600">
        <span className="font-semibold text-ink">Why you see this attorney: </span>
        {why}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="btn btn-primary btn-sm" aria-hidden>
          Request consultation
        </span>
        <span className="btn btn-outline btn-sm" aria-hidden>
          View fit details
        </span>
      </div>
    </article>
  );
}

export function MatchExperience() {
  return (
    <section className="section bg-paper">
      <div className="site-container grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <p className="eyebrow">The match</p>
          <h2 className="title-1 mt-4">Results built from your matter, not a directory.</h2>
          <p className="lede mt-5">
            After screening, you see attorneys who actually fit your jurisdiction and practice area, and who can take your
            matter now. Nothing is ranked by advertising.
          </p>
          <ul className="mt-8 space-y-3.5">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[1.02rem] text-slate-700">
                <ShieldCheck size={20} className="mt-0.5 flex-none text-green-600" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <Card
            initials="MA"
            name="M. Alvarez"
            focus="Landlord and tenant disputes"
            where="Licensed in your state"
            avail="Available to take a new matter"
            reply="Typically replies within 24 hours"
            why="Covers your state, practices tenant law and has no platform-level conflict."
          />
          <Card
            initials="JO"
            name="J. Okafor"
            focus="Civil disputes and contracts"
            where="State and federal"
            avail="Limited availability this week"
            reply="Replies within 24 hours"
            why="Covers your state and handles civil matters of this kind."
          />
          <p className="px-1 text-[0.85rem] text-mute">Illustrative profiles. Your results come from real attorneys on the platform.</p>
        </div>
      </div>
    </section>
  );
}
