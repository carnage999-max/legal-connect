"use client";

import { Logo } from '@/components/Logo';

export function LoadingSpinner() {
  return (
    <div role="status" className="grid min-h-screen place-items-center bg-white">
      <div className="flex flex-col items-center gap-6">
        <Logo href={null} />
        <div className="flex items-center gap-2" aria-hidden>
          {['bg-blue-500', 'bg-green-500', 'bg-blue-500'].map((c, i) => (
            <span key={i} className={`h-2.5 w-2.5 rounded-full ${c} animate-bounce`} style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <p className="text-sm text-mute">Loading…</p>
      </div>
    </div>
  );
}
