'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/Logo';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Start Legal Intake', href: '/intake' },
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Sign in', href: '/login' },
      { label: 'Create an account', href: '/signup' },
    ],
  },
  {
    title: 'For attorneys',
    links: [
      { label: 'Why join', href: '/#for-attorneys' },
      { label: 'Apply to join', href: '/attorneys/apply' },
      { label: 'Attorney sign in', href: '/attorney/login' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Our story', href: '/#story' },
      { label: 'Common questions', href: '/#faq' },
    ],
  },
  {
    title: 'Trust and legal',
    links: [
      { label: 'Security', href: '/#security' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Delete your account', href: '/delete-account' },
    ],
  },
];

// Routes that bring their own chrome (auth screens and both portals).
const BARE = ['/app', '/login', '/signup', '/attorney/login', '/forgot-password', '/reset-password', '/verify-email', '/intake'];

export function SiteFooter() {
  const pathname = usePathname();
  if (BARE.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;
  return <Footer />;
}

export function Footer() {
  return (
    <footer className="dark-surface bg-navy-950 text-slate-300">
      <div className="split-rule" aria-hidden />
      <div className="site-container py-14 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Logo tone="dark" hideWordOnTiny={false} />
            <p className="mt-5 max-w-xs text-[0.95rem] leading-relaxed text-slate-400">
              Describe your legal issue once. Legal Connect screens for conflicts, finds available attorneys and opens a
              secure conversation.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h2 className="text-sm font-semibold text-white">{col.title}</h2>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-[0.95rem] text-slate-400 transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-slate-500 md:flex-row md:items-start md:justify-between">
          <p className="max-w-2xl leading-relaxed">
            Legal Connect is a technology platform that connects people with independent, licensed attorneys. It is not a
            law firm and does not provide legal advice. Using the platform does not create an attorney-client relationship.
          </p>
          <p className="flex-none">© {new Date().getFullYear()} Legal Connect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
