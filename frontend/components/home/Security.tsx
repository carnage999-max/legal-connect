import Image from 'next/image';
import { Database, EyeOff, FileLock2, KeyRound, Lock, Trash2 } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';

const ITEMS = [
  { icon: Lock, title: 'Encrypted connections', text: 'Everything you send travels over an encrypted connection.' },
  { icon: EyeOff, title: 'Protected party names', text: 'Names are transformed before conflict screening compares them.' },
  { icon: FileLock2, title: 'Protected file exchange', text: 'Documents live inside the platform, not in email attachments.' },
  { icon: KeyRound, title: 'Access controls', text: 'People see only the matters and stages they are authorized for.' },
  { icon: Database, title: 'Data minimization', text: 'We ask for what matching needs and nothing more.' },
  { icon: Trash2, title: 'You stay in control', text: 'You can request deletion of your account and data at any time.' },
];

export function Security() {
  return (
    <section id="security" className="section bg-paper">
      <div className="site-container grid gap-14 lg:grid-cols-[1fr_1.25fr] lg:gap-20">
        <Reveal>
          <h2 className="title-1">Your matter is yours.</h2>
          <p className="lede mt-6">Legal problems are personal. These are the protections behind every intake, screening and message.</p>
          <Image
            src="/lady-justice-statue.jpeg"
            alt="A bronze statue of Lady Justice holding scales in front of a columned courthouse at sunset."
            width={1672}
            height={941}
            sizes="320px"
            className="mt-10 h-auto w-full max-w-[320px] rounded-3xl"
          />
        </Reveal>

        <dl className="grid gap-x-10 sm:grid-cols-2">
          {ITEMS.map((item, i) => (
            <Reveal key={item.title} delay={(i % 2) * 0.08} className="border-t border-hairline py-7">
              <item.icon size={26} strokeWidth={1.5} className="mb-3 text-ink" />
              <dt className="text-lg font-semibold tracking-tight">{item.title}</dt>
              <dd className="mt-2 text-[0.97rem] leading-relaxed text-mute">{item.text}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
