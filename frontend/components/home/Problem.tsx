import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

const OLD = ['Search for lawyers', 'Leave voicemails', 'Repeat your story at every firm', 'Hit a conflict', 'Start over'];
const NEW = ['Describe it once', 'Conflicts screened', 'Matched to available attorneys', 'Connected securely'];

export function Problem() {
  return (
    <section className="section bg-paper">
      <div className="site-container">
        <div className="max-w-3xl">
          <p className="eyebrow">The problem</p>
          <h2 className="title-1 mt-4">Finding an attorney should not mean telling your story over and over.</h2>
          <p className="lede mt-5">
            Most people call firm after firm, only to learn the lawyer is not taking clients or has a conflict. Every call
            starts from zero.
          </p>
        </div>

        <figure className="mt-12">
          <Image
            src="/problem-to-solution-woman.jpeg"
            alt="On the left, a stressed woman at a laptop surrounded by notes reading no one calls back and conflict of interest. On the right, the same woman shaking hands with an attorney. Legal Connect sits between them."
            width={1672}
            height={941}
            sizes="(min-width: 1280px) 1216px, calc(100vw - 2.5rem)"
            className="h-auto w-full rounded-[22px] shadow-[0_30px_70px_-30px_rgb(16_24_40/0.45)]"
          />
        </figure>

        <div className="mt-14 space-y-10">
          <div>
            <h3 className="title-3 text-mute">Calling around</h3>
            <ol className="mt-4 flex flex-col gap-2 md:flex-row md:items-stretch md:gap-0">
              {OLD.map((step, i) => (
                <li
                  key={step}
                  className="flex flex-1 items-center gap-3 rounded-xl border border-hairline bg-white px-4 py-3.5 text-[0.95rem] text-mute md:rounded-none md:first:rounded-l-xl md:last:rounded-r-xl md:[&:not(:first-child)]:border-l-0"
                >
                  <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="title-3 text-green-700">With Legal Connect</h3>
            <ol className="mt-4 flex flex-col gap-2 md:flex-row md:items-stretch md:gap-0">
              {NEW.map((step) => (
                <li
                  key={step}
                  className="flex flex-1 items-center gap-3 rounded-xl border border-green-600/25 bg-green-50 px-4 py-3.5 font-medium text-green-700 md:rounded-none md:first:rounded-l-xl md:last:rounded-r-xl md:[&:not(:first-child)]:border-l-0"
                >
                  <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-green-600 text-white">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-10">
          <Link href="/intake" className="btn btn-primary btn-lg group">
            Start Legal Intake
            <ArrowRight size={19} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
