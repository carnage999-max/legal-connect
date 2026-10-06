import Image from 'next/image';
import { EyeOff, FileLock2, KeyRound, ScrollText, Trash2, Lock } from 'lucide-react';

const ITEMS = [
  { icon: Lock, title: 'Encrypted connections', text: 'Everything you send travels over an encrypted connection.' },
  { icon: EyeOff, title: 'Protected party names', text: 'Names are transformed before conflict screening compares them.' },
  { icon: FileLock2, title: 'Protected file exchange', text: 'Documents live inside the platform, not in email attachments.' },
  { icon: KeyRound, title: 'Access controls', text: 'People see only the matters and stages they are authorized for.' },
  { icon: ScrollText, title: 'Data minimization', text: 'We ask for what matching needs and nothing more.' },
  { icon: Trash2, title: 'You stay in control', text: 'You can request deletion of your account and data at any time.' },
];

export function Security() {
  return (
    <section id="security" className="dark-surface relative overflow-hidden bg-navy-900 text-white">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
      <div className="site-container section">
        <div className="max-w-3xl">
          <p className="eyebrow">Trust and security</p>
          <h2 className="title-1 mt-4">Your matter is yours. The platform is built around that.</h2>
          <p className="lede mt-5">
            Legal problems are personal. These are the protections behind every intake, screening and message.
          </p>
        </div>

        <figure className="mt-12">
          <Image
            src="/lady-justice-statue.jpeg"
            alt="A bronze statue of Lady Justice holding scales and a sword in front of a columned courthouse at sunset, with the words justice, equality and opportunity carved above the entrance."
            width={1672}
            height={941}
            sizes="(min-width: 1280px) 1216px, calc(100vw - 2.5rem)"
            className="h-auto w-full rounded-[22px] ring-1 ring-white/10"
          />
        </figure>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-green-500/15 text-green-400">
                <Icon size={22} />
              </span>
              <h3 className="title-3 mt-5">{title}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-slate-400">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
