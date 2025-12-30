"use client";
import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Menu, X } from 'lucide-react';

const navTabs = [
  { name: 'Dashboard', href: '/app/client/dashboard' },
  { name: 'My Matters', href: '/app/client/matters' },
  { name: 'New Matter', href: '/intake' },
  { name: 'Messages', href: '/app/client/messages' },
  { name: 'Documents', href: '/app/client/documents' },
  { name: 'Payments', href: '/app/client/payments' },
  { name: 'Account', href: '/app/client/account' }
];

export function ClientLayout({ children }: { children: ReactNode }): React.ReactNode {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to access the client dashboard.</p>
      </div>
    );
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-white text-lctextprimary">
      {/* Top Navigation */}
      <header className="border-b border-lcborder sticky top-0 z-50 bg-white">
        <div className="site-container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition">
            <img src="/logo.png" alt="Legal Connect" className="h-6 w-6" />
            <span className="inline sm:inline">Legal Connect</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navTabs.map(tab => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`text-sm font-medium transition-colors py-2 border-b-2 ${
                  isActive(tab.href)
                    ? 'text-lcaccentclient border-lcaccentclient'
                    : 'text-lctextsecondary hover:text-lctextprimary border-transparent'
                }`}
              >
                {tab.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Logout */}
          <button
            onClick={logout}
            className="hidden md:block text-sm text-lctextsecondary hover:text-lctextprimary"
          >
            Logout
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-lcborder bg-white">
            <nav className="site-container py-4 flex flex-col gap-3">
              {navTabs.map(tab => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium transition-colors py-2 px-3 rounded-lg ${
                    isActive(tab.href)
                      ? 'bg-blue-50 text-lcaccentclient'
                      : 'text-lctextsecondary hover:bg-gray-50'
                  }`}
                >
                  {tab.name}
                </Link>
              ))}
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="text-sm text-lctextsecondary hover:text-lctextprimary text-left py-2 px-3"
              >
                Logout
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="site-container py-8">
        {children}
      </main>
    </div>
  );
}
