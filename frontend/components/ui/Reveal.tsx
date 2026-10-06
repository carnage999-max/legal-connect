'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Fades and lifts its children into place once, as they scroll into view.
 * Content is visible by default, so nothing is hidden if JavaScript is slow.
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'li' | 'section';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'idle' | 'pending' | 'shown'>('idle');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Anything already on screen when the page loads just stays put.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    setState('pending');
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState('shown');
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Component = Tag as 'div';
  return (
    <Component
      ref={ref}
      className={className}
      data-reveal={state === 'idle' ? undefined : state}
      style={delay ? ({ '--reveal-delay': `${delay}s` } as React.CSSProperties) : undefined}
    >
      {children}
    </Component>
  );
}
