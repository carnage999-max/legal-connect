'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, Scale, User, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';

const LINKS = [
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'For attorneys', href: '/#for-attorneys' },
  { label: 'Security', href: '/#security' },
  { label: 'Our story', href: '/#story' },
];

const SIGN_IN = [
  { label: 'Client sign in', note: 'Matters, messages and payments', href: '/login', icon: User },
  { label: 'Attorney sign in', note: 'Referrals, clients and billing', href: '/attorney/login', icon: Scale },
];

/**
 * Sticky header. With `overlay` it sits transparent on top of a dark hero and
 * turns solid once the page scrolls; otherwise it is solid from the start.
 */
export function Navbar({ overlay = false }: { overlay?: boolean }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const signInRef = useRef<HTMLDivElement>(null);

  const dashboardHref = user?.user_type === 'attorney' ? '/app/attorney/dashboard' : '/app/client/dashboard';
  const transparent = overlay && !scrolled && !menuOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSignInOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!signInOpen) return;
    const onDown = (e: MouseEvent) => {
      if (signInRef.current && !signInRef.current.contains(e.target as Node)) setSignInOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSignInOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [signInOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const linkClass = transparent
    ? 'text-slate-200 hover:text-white'
    : 'text-mute hover:text-ink';

  return (
    <>
      <header
        className={`${overlay ? 'fixed' : 'sticky'} inset-x-0 top-0 z-50 transition-colors duration-300 ${
          transparent
            ? 'dark-surface border-b border-transparent bg-transparent'
            : menuOpen
              ? 'dark-surface border-b border-white/10 bg-navy-900'
              : 'border-b border-hairline bg-white/90 backdrop-blur-xl'
        }`}
      >
        <div className="site-container flex items-center justify-between gap-3" style={{ height: 'var(--header-h)' }}>
          <Logo tone={transparent || menuOpen ? 'dark' : 'light'} />

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2 text-[0.95rem] font-medium transition-colors ${linkClass}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 lg:flex">
              {user ? (
                <Link href={dashboardHref} className={`rounded-lg px-3 py-2 text-[0.95rem] font-medium ${linkClass}`}>
                  Dashboard
                </Link>
              ) : (
                <div ref={signInRef} className="relative">
                  <button
                    type="button"
                    aria-expanded={signInOpen}
                    aria-haspopup="true"
                    onClick={() => setSignInOpen((v) => !v)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[0.95rem] font-medium transition-colors ${linkClass}`}
                  >
                    Sign in
                    <ChevronDown size={16} className={`transition-transform ${signInOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {signInOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-2xl border border-hairline bg-white p-1.5 shadow-[0_24px_60px_-20px_rgb(16_24_40/0.35)] rise-in">
                      {SIGN_IN.map(({ label, note, href, icon: Icon }) => (
                        <Link
                          key={href}
                          href={href}
                          className="flex items-center gap-3 rounded-xl p-3 text-ink transition-colors hover:bg-paper"
                        >
                          <span className="grid h-10 w-10 flex-none place-items-center rounded-lg bg-blue-50 text-blue-600">
                            <Icon size={20} />
                          </span>
                          <span>
                            <span className="block text-sm font-semibold">{label}</span>
                            <span className="block text-xs text-mute">{note}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link href="/intake" className="btn btn-primary btn-sm whitespace-nowrap">
              Start Legal Intake
            </Link>

            <button
              type="button"
              className={`grid h-11 w-11 place-items-center rounded-xl transition-colors lg:hidden ${
                transparent || menuOpen ? 'text-white hover:bg-white/10' : 'text-ink hover:bg-paper'
              }`}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-sheet"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {!transparent && <div className="split-rule opacity-90" aria-hidden />}
      </header>

      {menuOpen && (
        <div
          id="mobile-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="dark-surface fixed inset-0 z-40 overflow-y-auto bg-navy-900 lg:hidden"
          style={{ paddingTop: 'var(--header-h)' }}
        >
          <div className="site-container flex flex-col gap-1 pb-10 pt-4">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-4 text-2xl font-semibold tracking-tight text-white hover:bg-white/5"
              >
                {l.label}
              </Link>
            ))}

            <div className="my-4 h-px bg-white/10" />

            {user ? (
              <Link href={dashboardHref} onClick={() => setMenuOpen(false)} className="btn btn-outline btn-lg">
                Go to dashboard
              </Link>
            ) : (
              <div className="flex flex-col gap-3">
                {SIGN_IN.map(({ label, href, icon: Icon }) => (
                  <Link key={href} href={href} onClick={() => setMenuOpen(false)} className="btn btn-outline btn-lg justify-start">
                    <Icon size={20} />
                    {label}
                  </Link>
                ))}
              </div>
            )}

            <Link href="/intake" onClick={() => setMenuOpen(false)} className="btn btn-primary btn-lg mt-4">
              Start Legal Intake
            </Link>
            <Link href="/attorneys/apply" onClick={() => setMenuOpen(false)} className="btn btn-ghost mt-1">
              I&apos;m an attorney
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
