'use client';

import { useState } from 'react';
import { ProductPanel, STAGES, type StageIndex } from './ProductPanel';

export function HowItWorks() {
  const [stage, setStage] = useState<StageIndex>(0);

  return (
    <section id="how-it-works" className="section bg-white">
      <div className="site-container">
        <div className="max-w-3xl">
          <p className="eyebrow">How it works</p>
          <h2 className="title-1 mt-4">Four steps from your story to the right attorney.</h2>
          <p className="lede mt-5">Pick a step to see what you would see on screen.</p>
        </div>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <ol role="tablist" aria-label="Steps" aria-orientation="vertical" className="relative space-y-3">
            {STAGES.map((s, i) => {
              const on = stage === i;
              return (
                <li key={s.key}>
                  <button
                    role="tab"
                    type="button"
                    aria-selected={on}
                    onClick={() => setStage(i as StageIndex)}
                    className={`group flex w-full gap-4 rounded-2xl border p-5 text-left transition-all ${
                      on ? 'border-blue-500 bg-blue-50 shadow-[0_0_0_4px_rgb(30_127_214/0.12)]' : 'border-hairline bg-white hover:border-blue-400'
                    }`}
                  >
                    <span
                      className={`grid h-10 w-10 flex-none place-items-center rounded-full text-sm font-bold transition-colors ${
                        on ? 'bg-blue-600 text-white' : i < stage ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-lg font-semibold text-ink">{s.title}</span>
                      <span className={`mt-1 block text-[0.97rem] leading-relaxed ${on ? 'text-slate-700' : 'text-mute'}`}>
                        {s.blurb}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="lg:sticky lg:top-28">
            <ProductPanel stage={stage} />
          </div>
        </div>
      </div>
    </section>
  );
}
