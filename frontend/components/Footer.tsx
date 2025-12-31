"use client";
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-lcborder bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-sm text-lctextsecondary">
            © {new Date().getFullYear()} Legal Connect. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm text-lctextsecondary">
            <Link href="/privacy" className="hover:text-lctextprimary transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-lctextprimary transition">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
