'use client';

import { useEffect, useRef, useState } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { ProductPanel, STAGES, type StageIndex } from './ProductPanel';

/**
 * Scroll-driven on large screens: the panel stays put while the steps move past,
 * and the stage changes as each step reaches the middle of the screen.
 * On phones every step carries its own panel.
 */
export function HowItWorks() {
  const [stage, setStage] = useState<StageIndex>(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setStage(Number((e.target as HTMLElement).dataset.step) as StageIndex);
        });
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="section bg-paper">
      <div className="site-container">
        <Reveal>
          <h2 className="title-1 max-w-3xl">Four steps from your story to the right attorney.</h2>
        </Reveal>

        {/* Large screens */}
        <div className="mt-16 hidden gap-16 lg:grid lg:grid-cols-[1fr_1.05fr]">
          <ol className="relative">
            <span aria-hidden className="absolute bottom-0 left-0 top-0 w-px bg-hairline" />
            <span
              aria-hidden
              className="absolute left-0 top-0 w-px bg-ink transition-all duration-700 ease-out"
              style={{ height: `${((stage + 1) / STAGES.length) * 100}%` }}
            />
            {STAGES.map((s, i) => (
              <li
                key={s.key}
                data-step={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                className={`flex min-h-[62vh] flex-col justify-center pl-10 transition-opacity duration-500 ${
                  stage === i ? 'opacity-100' : 'opacity-30'
                }`}
              >
                <span className="tnum text-sm font-semibold text-mute">0{i + 1}</span>
                <h3 className="title-2 mt-2">{s.title}</h3>
                <p className="mt-4 max-w-md text-[1.15rem] leading-relaxed text-mute">{s.blurb}</p>
              </li>
            ))}
          </ol>

          <div className="relative">
            <div className="sticky top-[22vh]">
              <ProductPanel stage={stage} />
            </div>
          </div>
        </div>

        {/* Phones and tablets */}
        <ol className="mt-12 space-y-14 lg:hidden">
          {STAGES.map((s, i) => (
            <Reveal as="li" key={s.key}>
              <span className="tnum text-sm font-semibold text-mute">0{i + 1}</span>
              <h3 className="title-2 mt-1">{s.title}</h3>
              <p className="mb-6 mt-3 max-w-md text-[1.05rem] leading-relaxed text-mute">{s.blurb}</p>
              <ProductPanel stage={i as StageIndex} />
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
