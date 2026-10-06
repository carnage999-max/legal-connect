'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';
import { ProductPanel, STAGES, type StageIndex } from './ProductPanel';

const STEP_MS = 3400;

export function Hero() {
  const [stage, setStage] = useState<StageIndex>(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    if (mq.matches) setStage(2);
  }, []);

  useEffect(() => {
    if (paused || reduced) return;
    const id = window.setTimeout(() => setStage((s) => ((s + 1) % 4) as StageIndex), STEP_MS);
    return () => window.clearTimeout(id);
  }, [stage, paused, reduced]);

  return (
    <section className="dark-surface hero-bg relative isolate overflow-hidden text-white">
      <div aria-hidden className="grid-lines absolute inset-0 -z-10" />
      <div
        className="site-container grid items-center gap-12 pb-16 pt-[calc(var(--header-h)+3rem)] lg:min-h-[100svh] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-24"
      >
        <div>
          <p className="eyebrow">A faster way to find legal help</p>
          <h1 className="title-hero mt-5">Tell us once. We find the attorney.</h1>
          <p className="lede mt-6">
            Describe your legal issue a single time. Legal Connect screens for conflicts, finds available attorneys in
            your jurisdiction and opens a secure conversation.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/intake" className="btn btn-primary btn-lg group">
              Start Legal Intake
              <ArrowRight size={19} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/attorneys/apply" className="btn btn-outline btn-lg">
              I&apos;m an attorney
            </Link>
          </div>

          <p className="mt-7 flex items-center gap-2 text-[0.95rem] text-slate-400">
            <Lock size={15} className="flex-none text-green-400" />
            Secure · Private · Built for real legal matters
          </p>
        </div>

        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div role="tablist" aria-label="Product preview" className="mb-3 grid grid-cols-4 gap-1.5">
            {STAGES.map((s, i) => (
              <button
                key={s.key}
                role="tab"
                type="button"
                aria-selected={stage === i}
                onClick={() => {
                  setStage(i as StageIndex);
                  setPaused(true);
                }}
                className={`relative min-h-11 overflow-hidden rounded-xl px-2 py-2 text-[0.82rem] font-semibold transition-colors sm:text-sm ${
                  stage === i ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s.title}
                {stage === i && !paused && !reduced && (
                  <span
                    key={`${stage}-bar`}
                    className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-green-400"
                    style={{ animation: `stage-fill ${STEP_MS}ms linear both` }}
                  />
                )}
                {stage === i && (paused || reduced) && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-green-400" />}
              </button>
            ))}
          </div>
          <ProductPanel stage={stage} />
        </div>
      </div>
    </section>
  );
}
