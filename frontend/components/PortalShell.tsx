'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';

export type PortalNavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

/**
 * Shared frame for both portals: a sidebar on desktop and a slide-over menu on
 * phones. The attorney portal is the dark one; everything inside it restyles
 * through the `.dark-surface` tokens.
 */
export function PortalShell({
  variant,
  nav,
  portalLabel,
  children,
}: {
  variant: 'client' | 'attorney';
  nav: PortalNavItem[];
  portalLabel: string;
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const dark = variant === 'attorney';

  useEffect(() => {
    setHasToken(!!localStorage.getItem('lc_token'));
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const shell = dark ? 'dark-surface bg-navy-900 text-ink' : 'bg-paper text-ink';

  if (!user) {
    return (
      <div className={`grid min-h-screen place-items-center px-5 ${shell}`}>
        {hasToken ? (
          <div role="status" className="flex items-center gap-3 text-mute">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Loading your workspace…
          </div>
        ) : (
          <div className="card max-w-md p-8 text-center">
            <Logo href={null} tone={dark ? 'dark' : 'light'} />
            <h1 className="title-3 mt-6 text-[1.4rem]">Please sign in</h1>
            <p className="mt-2 text-mute">
              Sign in to open your {dark ? 'attorney' : 'client'} dashboard.
            </p>
            <Link href={dark ? '/attorney/login' : '/login'} className={`btn btn-lg mt-6 w-full ${dark ? 'btn-blue' : 'btn-primary'}`}>
              Go to sign in
            </Link>
          </div>
        )}
      </div>
    );
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const accent = dark ? 'bg-blue-500/15 text-blue-600' : 'bg-green-50 text-green-700';
  const initials = (user.username || 'U').trim().charAt(0).toUpperCase();

  const navList = (
    <nav aria-label={`${portalLabel} navigation`} className="flex flex-col gap-1">
      {nav.map(({ label, href, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-[0.95rem] font-medium transition-colors ${
              active ? `${accent} font-semibold` : 'text-mute hover:bg-[color:var(--color-paper)] hover:text-ink'
            }`}
          >
            <Icon size={19} className="flex-none" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const account = (
    <div className="border-t border-hairline pt-4">
      <div className="flex items-center gap-3 px-1">
        <span
          className={`grid h-10 w-10 flex-none place-items-center rounded-full text-sm font-bold text-white ${
            dark ? 'bg-[#2b7fd6]' : 'bg-[#1e8e3e]'
          }`}
        >
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{user.username}</p>
          <p className="text-xs text-mute">{portalLabel}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          logout();
          setOpen(false);
        }}
        className="btn btn-outline btn-sm mt-4 w-full"
      >
        <LogOut size={16} /> Sign out
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen ${shell}`}>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col gap-6 border-r border-hairline bg-[color:var(--surface,#fff)] p-5 lg:flex">
        <div className="px-1 pt-1">
          <Logo tone={dark ? 'dark' : 'light'} hideWordOnTiny={false} />
        </div>
        <div className="flex-1 overflow-y-auto">{navList}</div>
        {account}
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-hairline bg-[color:var(--surface,#fff)]/95 px-4 backdrop-blur lg:hidden">
        <Logo tone={dark ? 'dark' : 'light'} />
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="portal-menu"
          onClick={() => setOpen(true)}
          className="grid h-11 w-11 place-items-center rounded-xl text-ink hover:bg-[color:var(--color-paper)]"
        >
          <Menu size={24} />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu" id="portal-menu">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/55" onClick={() => setOpen(false)} />
          <div className={`rise-in absolute inset-y-0 right-0 flex w-[min(86vw,320px)] flex-col gap-6 bg-[color:var(--surface,#fff)] p-5 shadow-2xl ${dark ? 'dark-surface' : ''}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-mute">{portalLabel}</span>
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center rounded-xl text-ink hover:bg-[color:var(--color-paper)]">
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{navList}</div>
            {account}
          </div>
        </div>
      )}

      <main className="lg:pl-[264px]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">{children}</div>
      </main>
    </div>
  );
}
