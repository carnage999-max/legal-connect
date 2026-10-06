import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ClipboardList, Lock, ShieldCheck, Zap } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';

const CAPABILITIES = [
  { icon: ClipboardList, title: 'Guided intake', text: 'One conversation instead of a wall of forms.' },
  { icon: ShieldCheck, title: 'Conflict screening', text: 'Run before any attorney is contacted.' },
  { icon: Zap, title: 'Real-time availability', text: 'Only attorneys who can take your matter on.' },
  { icon: Lock, title: 'Secure messaging', text: 'Messages and files stay in one place.' },
];

const OLD = ['Search for lawyers', 'Leave voicemails', 'Repeat your story at every firm', 'Hit a conflict', 'Start over'];
const NEW = ['Describe it once', 'Conflicts screened', 'Matched to available attorneys', 'Connected securely'];

export function Problem() {
  return (
    <section className="section bg-white">
      <div className="site-container">
        <Reveal>
          <h2 className="title-1 max-w-4xl">Finding an attorney shouldn&apos;t mean telling your story over and over.</h2>
        </Reveal>

        <Reveal delay={0.05}>
          <dl className="mt-14 grid gap-x-8 gap-y-8 border-t border-hairline pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map((c) => (
              <div key={c.title}>
                <c.icon size={28} strokeWidth={1.5} className="mb-4 text-ink" />
                <dt className="font-semibold text-ink">{c.title}</dt>
                <dd className="mt-1.5 text-[0.97rem] leading-relaxed text-mute">{c.text}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <div className="mt-20 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          <Reveal className="tile flex flex-col">
            <h3 className="title-2">Every call starts from zero.</h3>
            <p className="mb-8 mt-4 max-w-md text-[1.05rem] leading-relaxed text-mute">
              Most people call firm after firm, only to learn the lawyer is not taking clients or has a conflict.
            </p>
            <Image
              src="/problem-to-solution-woman.jpeg"
              alt="On the left, a stressed woman at a laptop surrounded by notes reading no one calls back and conflict of interest. On the right, the same woman shaking hands with an attorney."
              width={1672}
              height={941}
              sizes="(min-width: 1024px) 560px, calc(100vw - 4rem)"
              className="mt-auto h-auto w-full max-w-xl rounded-2xl pt-0"
            />
          </Reveal>

          <div className="grid gap-5">
            <Reveal delay={0.08} className="tile">
              <h3 className="font-semibold text-mute">Calling around</h3>
              <ol className="mt-5 space-y-3 text-[1.15rem] leading-snug text-ink/45">
                {OLD.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </Reveal>
            <Reveal delay={0.16} className="tile tile-dark dark-surface black-surface">
              <h3 className="font-semibold text-[#5bd16e]">With Legal Connect</h3>
              <ol className="mt-5 space-y-3 text-[1.15rem] leading-snug">
                {NEW.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <Link href="/intake" className="link-arrow mt-7 text-[1.05rem]">
                Start Legal Intake <ArrowRight size={18} aria-hidden />
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
