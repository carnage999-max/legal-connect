'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const COLUMNS = [
  [
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Start Legal Intake', href: '/intake' },
    { label: 'Security', href: '/#security' },
    { label: 'Common questions', href: '/#faq' },
    { label: 'Our story', href: '/#story' },
  ],
  [
    { label: 'For attorneys', href: '/#for-attorneys' },
    { label: 'Apply to join', href: '/attorneys/apply' },
    { label: 'Attorney sign in', href: '/attorney/login' },
    { label: 'Client sign in', href: '/login' },
    { label: 'Create an account', href: '/signup' },
  ],
  [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Delete your account', href: '/delete-account' },
  ],
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
    <footer className="dark-surface black-surface overflow-hidden bg-black text-white">
      <div className="site-container pt-20 md:pt-28">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <p className="max-w-xl text-[clamp(2rem,4.4vw,3.6rem)] font-light leading-[1.08] tracking-[-0.035em]">
            Describe your legal issue once. We find the attorney.
          </p>
          {COLUMNS.map((links, i) => (
            <nav key={i} aria-label={`Footer ${i + 1}`}>
              <ul className="space-y-4">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-[1rem] text-white/90 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-24 flex items-center gap-[0.18em] text-[clamp(2.2rem,9.2vw,9rem)] font-semibold leading-none tracking-[-0.05em] md:mt-32" aria-hidden>
          <Image src="/logo.jpeg" alt="" width={256} height={256} className="h-[0.86em] w-[0.86em] flex-none rounded-[0.14em]" />
          <span className="whitespace-nowrap">Legal Connect</span>
        </div>

        <div className="mt-10 flex flex-col gap-4 pb-10 text-[0.8rem] text-[#8e8e93] md:flex-row md:items-start md:justify-between">
          <p className="max-w-2xl leading-relaxed">
            Legal Connect is a technology platform that connects people with independent, licensed attorneys. It is not a law
            firm and does not provide legal advice. Using the platform does not create an attorney-client relationship.
          </p>
          <p className="flex-none">© {new Date().getFullYear()} Legal Connect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
