'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductPanel, type StageIndex } from './ProductPanel';

const STEP_MS = 3600;

export function Hero() {
  const [stage, setStage] = useState<StageIndex>(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    if (mq.matches) setStage(2);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const id = window.setTimeout(() => setStage((s) => ((s + 1) % 4) as StageIndex), STEP_MS);
    return () => window.clearTimeout(id);
  }, [stage, reduced]);

  const lines = ['Tell us once.', 'We find the attorney.'];

  return (
    <section className="dark-surface black-surface hero-bg relative isolate overflow-hidden text-white">
      {!reduced && (
        <video
          aria-hidden
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-50"
          src="/hero-video.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      )}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(0_0_0/0.6)_0%,rgb(0_0_0/0.4)_40%,rgb(8_8_10/0.92)_100%)]"
      />

      <div className="site-container pb-16 pt-[calc(var(--header-h)+2.5rem)] text-center md:pb-24 md:pt-[calc(var(--header-h)+4.5rem)]">
        {/* Phones: the logo leads, centered. The animated steps are for larger screens. */}
        <Image
          src="/logo.jpeg"
          alt="Legal Connect"
          width={176}
          height={176}
          priority
          className="mx-auto mb-8 h-[88px] w-[88px] rounded-[22px] md:hidden"
        />

        <h1 className="title-hero mx-auto max-w-6xl">
          {lines.map((line, i) => (
            <span key={line} className="line-mask">
              <span className="line-up" style={{ '--d': `${0.1 + i * 0.14}s` } as React.CSSProperties}>
                {line}
              </span>
            </span>
          ))}
        </h1>

        <p className="lede tick-in mx-auto mt-6 text-[#d2d2d7]" style={{ '--d': '0.45s' } as React.CSSProperties}>
          Describe your legal issue a single time. Legal Connect screens for conflicts, finds available attorneys in your
          jurisdiction and opens a secure conversation.
        </p>

        <div
          className="tick-in mt-9 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center"
          style={{ '--d': '0.6s' } as React.CSSProperties}
        >
          <Link href="/intake" className="btn btn-primary btn-lg">
            Start Legal Intake
          </Link>
          <Link href="/attorneys/apply" className="link-arrow justify-center text-lg">
            I&apos;m an attorney <span aria-hidden>›</span>
          </Link>
        </div>

        <div className="tick-in mx-auto mt-16 hidden max-w-2xl text-left md:block" style={{ '--d': '0.8s' } as React.CSSProperties}>
          <ProductPanel stage={stage} />
        </div>
      </div>
    </section>
  );
}
