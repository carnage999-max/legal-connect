"use client";
import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const navTabs = ['Dashboard', 'New Matter', 'Messages', 'Documents', 'Payments', 'Account'];

export function ClientLayout({ children }: { children: ReactNode }): React.ReactNode {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = React.useState('Dashboard');

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to access the client dashboard.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-lctextprimary">
      {/* Top Navigation */}
      <header className="border-b border-lcborder">
        <div className="site-container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition">
            <img src="/logo.png" alt="Legal Connect" className="h-6 w-6" />
            <span>Legal Connect</span>
          </Link>
          <nav className="flex items-center gap-8">
            {navTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-lcaccent-client border-b-2 border-lc-accent-client'
                    : 'text-lctextsecondary hover:text-lctextprimary'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
          <button
            onClick={logout}
            className="text-sm text-lctextsecondary hover:text-lctextprimary"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="site-container py-8">
        {children}
      </main>
    </div>
  );
}
