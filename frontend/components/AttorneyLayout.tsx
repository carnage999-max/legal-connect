"use client";
import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

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
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to access the attorney dashboard.</p>
      </div>
    );
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href);

  return (
    <div className="flex min-h-screen bg-lcbgattorney text-lctextattorney">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-lcborder-attorney flex items-center px-4 z-40">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg ml-4 hover:opacity-80 transition">
          <img src="/logo.png" alt="Legal Connect" className="h-6 w-6" />
          <span>Legal Connect</span>
        </Link>
      </header>

      {/* Side Navigation */}
      <aside className={`fixed md:static md:w-64 bg-lcbgattorney-secondary border-r border-lcborder-attorney p-6 transition-transform duration-200 ${
        sidebarOpen ? 'left-0 w-64 top-16 md:top-0' : '-left-64 md:left-0'
      } md:translate-x-0 h-[calc(100vh-64px)] md:h-screen md:p-6 z-30`}>
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg mb-8 hover:opacity-80 transition hidden md:flex">
          <img src="/logo.png" alt="Legal Connect" className="h-6 w-6" />
          <span>Legal Connect</span>
        </Link>
        <nav className="space-y-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`block px-4 py-2 rounded text-sm transition-colors ${
                isActive(item.href)
                  ? 'bg-lcbgattorney text-lctextattorney font-semibold'
                  : 'text-lctextattorney-secondary hover:bg-lcbgattorney'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => { logout(); setSidebarOpen(false); }}
          className="w-full mt-8 px-4 py-2 border border-lcborder-attorney rounded text-sm text-lctextattorney hover:bg-lcbgattorney-secondary transition-colors"
        >
          Logout
        </button>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-20"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 md:mt-0 mt-16">
        {children}
      </main>
    </div>
  );
}
