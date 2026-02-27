'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ChevronDown, Menu, X, User, Scale } from 'lucide-react';

export function Navbar() {
  const { user } = useAuth();
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [showSignupDropdown, setShowSignupDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileLoginDropdown, setShowMobileLoginDropdown] = useState(false);
  const [showMobileSignupDropdown, setShowMobileSignupDropdown] = useState(false);

  const loginDropdownRef = useRef<HTMLDivElement>(null);
  const signupDropdownRef = useRef<HTMLDivElement>(null);

  const loginOptions = [
    { label: 'Client Login', href: '/login', icon: User },
    { label: 'Attorney Login', href: '/attorney/login', icon: Scale },
  ];

  const signupOptions = [
    { label: 'Client', href: '/signup', icon: User },
    { label: 'Attorney', href: '/attorneys/apply', icon: Scale },
  ];

  // Desktop Dropdown Button Component
  const DesktopDropdownButton = ({
    label,
    options,
    isOpen,
    onEnter,
    onLeave,
    dropdownRef,
  }: {
    label: string;
    options: Array<{ label: string; href: string; icon: React.ComponentType<any> }>;
    isOpen: boolean;
    onEnter: () => void;
    onLeave: () => void;
    dropdownRef: React.RefObject<HTMLDivElement | null>;
  }) => (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <button
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm text-white transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)',
          boxShadow: isOpen
            ? '0 6px 16px rgba(6, 95, 70, 0.3)'
            : '0 4px 12px rgba(6, 95, 70, 0.2)',
          transform: isOpen ? 'translateY(-2px)' : 'translateY(0)',
        }}
      >
        {label}
        <ChevronDown
          size={18}
          className={`transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-lcborder overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((option, idx) => {
            const IconComponent = option.icon;
            return (
              <Link
                key={idx}
                href={option.href}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors duration-150 border-b border-lcborder last:border-b-0 group"
              >
                <IconComponent size={20} className="text-lcaccentclient flex-shrink-0" />
                <div className="flex-1">
                  <span className="block text-sm font-medium text-lctextprimary">
                    {option.label}
                  </span>
                  <span className="block text-xs text-lctextsecondary">
                    {option.label.includes('Attorney')
                      ? 'Join as a legal professional'
                      : 'Get legal help'}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );

  // Mobile Menu Item with Dropdown
  const MobileDropdownItem = ({
    label,
    options,
    isOpen,
    onToggle,
  }: {
    label: string;
    options: Array<{ label: string; href: string; icon: React.ComponentType<any> }>;
    isOpen: boolean;
    onToggle: () => void;
  }) => (
    <div className="border-b border-lcborder last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-lctextprimary font-medium hover:bg-slate-50 transition-colors"
      >
        {label}
        <ChevronDown
          size={18}
          className={`transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="bg-slate-50 border-t border-lcborder">
          {options.map((option, idx) => {
            const IconComponent = option.icon;
            return (
              <Link
                key={idx}
                href={option.href}
                className="flex items-center gap-3 px-6 py-3 hover:bg-slate-100 transition-colors text-sm text-lctextprimary border-b border-lcborder/50 last:border-b-0"
                onClick={() => setShowMobileMenu(false)}
              >
                <IconComponent size={18} className="text-lcaccentclient flex-shrink-0" />
                <div>
                  <span className="font-medium">{option.label}</span>
                  <span className="block text-xs text-lctextsecondary">
                    {option.label.includes('Attorney')
                      ? 'Join as legal professional'
                      : 'Get legal help'}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-lcborder shadow-sm">
      <div className="site-container py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <img src="/logo.png" alt="Legal Connect" className="h-8 w-8" />
            <span className="font-bold text-xl text-lcaccentclient">Legal Connect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              // Authenticated state
              <>
                {user.user_type === 'attorney' ? (
                  <Link
                    href="/app/attorney/dashboard"
                    className="text-sm font-medium text-lcaccentattorney hover:text-lcaccent transition px-3 py-2 rounded-lg hover:bg-slate-50"
                  >
                    Attorney Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/app/client/dashboard"
                    className="text-sm font-medium text-lcaccentclient hover:text-lcaccent transition px-3 py-2 rounded-lg hover:bg-slate-50"
                  >
                    Client Dashboard
                  </Link>
                )}
              </>
            ) : (
              // Unauthenticated state - New button design
              <>
                <DesktopDropdownButton
                  label="Login"
                  options={loginOptions}
                  isOpen={showLoginDropdown}
                  onEnter={() => setShowLoginDropdown(true)}
                  onLeave={() => setShowLoginDropdown(false)}
                  dropdownRef={loginDropdownRef}
                />
                <DesktopDropdownButton
                  label="Sign Up"
                  options={signupOptions}
                  isOpen={showSignupDropdown}
                  onEnter={() => setShowSignupDropdown(true)}
                  onLeave={() => setShowSignupDropdown(false)}
                  dropdownRef={signupDropdownRef}
                />
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle menu"
          >
            {showMobileMenu ? (
              <X size={24} className="text-lctextprimary" />
            ) : (
              <Menu size={24} className="text-lctextprimary" />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden mt-4 pb-4 border-t border-lcborder animate-in fade-in slide-in-from-top-2 duration-200">
            {user ? (
              // Authenticated state
              <Link
                href={
                  user.user_type === 'attorney'
                    ? '/app/attorney/dashboard'
                    : '/app/client/dashboard'
                }
                className="block px-4 py-3 text-lctextprimary font-medium hover:bg-slate-50 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                {user.user_type === 'attorney' ? 'Attorney Dashboard' : 'Client Dashboard'}
              </Link>
            ) : (
              // Unauthenticated state - Mobile dropdowns
              <>
                <MobileDropdownItem
                  label="Login"
                  options={loginOptions}
                  isOpen={showMobileLoginDropdown}
                  onToggle={() => setShowMobileLoginDropdown(!showMobileLoginDropdown)}
                />
                <MobileDropdownItem
                  label="Sign Up"
                  options={signupOptions}
                  isOpen={showMobileSignupDropdown}
                  onToggle={() => setShowMobileSignupDropdown(!showMobileSignupDropdown)}
                />
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
