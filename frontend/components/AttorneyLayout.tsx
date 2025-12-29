"use client";
import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { label: 'Dashboard', href: '/app/attorney/dashboard' },
  { label: 'New Requests', href: '/app/attorney/requests' },
  { label: 'Active Clients', href: '/app/attorney/clients' },
  { label: 'Calendar', href: '/app/attorney/calendar' },
  { label: 'Messages', href: '/app/attorney/messages' },
  { label: 'Billing', href: '/app/attorney/billing' },
  { label: 'Account', href: '/app/attorney/account' },
];

export function AttorneyLayout({ children }: { children: ReactNode }): React.ReactNode {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to access the attorney dashboard.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-lcbgattorney text-lctextattorney">
      {/* Side Navigation */}
      <aside className="w-64 bg-lcbgattorney-secondary border-r border-lcborder-attorney p-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg mb-8 hover:opacity-80 transition">
          <img src="/logo.png" alt="Legal Connect" className="h-6 w-6" />
          <span>Legal Connect</span>
        </Link>
        <nav className="space-y-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 rounded text-sm text-lctextattorney-secondary hover:bg-lcbgattorney transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={logout}
          className="w-full mt-8 px-4 py-2 border border-lcborder-attorney rounded text-sm text-lctextattorney hover:bg-lcbgattorney-secondary transition-colors"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
