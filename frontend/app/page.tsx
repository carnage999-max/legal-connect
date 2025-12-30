'use client';
import { Shield, CheckCircle2, Lock, AlertCircle, Clock, Eye, FileText } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home(): React.ReactNode {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <div className="min-h-screen bg-white text-lctextprimary">
      <header className="site-container pt-8 pb-4 border-b border-lcborder">
        <nav className="flex items-center justify-between">
          <Link href="/" className="font-bold text-2xl hover:opacity-80 transition">Legal Connect</Link>
          <div className="flex items-center gap-6">
            {mounted && user ? (
              <>
                {user.user_type === 'attorney' ? (
                  <Link href="/app/attorney/dashboard" className="text-sm font-medium text-lcaccent-attorney hover:opacity-80 transition">Attorney Dashboard</Link>
                ) : (
                  <Link href="/app/client/dashboard" className="text-sm font-medium text-lcaccent-client hover:opacity-80 transition">Client Dashboard</Link>
                )}
              </>
            ) : (
              <>
                <a href="/login" className="text-sm font-medium text-lctextsecondary hover:text-lctextprimary transition">Client Login</a>
                <a href="/signup" className="text-sm font-medium text-lctextsecondary hover:text-lctextprimary transition">Client Signup</a>
                <a href="/attorney/login" className="text-sm font-medium text-lctextsecondary hover:text-lctextprimary transition">Attorney Login</a>
              </>
            )}
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section with Image */}
        <section className="site-container py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl leading-tight font-semibold mb-6">Start resolving legal problems faster.</h1>
              <p className="text-xl text-lctextsecondary mb-8 leading-relaxed">Describe your legal issue once. Our system runs automated conflict screening, matches available attorneys in real time, and starts secure communication immediately.</p>
              <div className="flex items-center gap-4">
                <a className="btn-primary inline-block" href="/intake">Start Legal Intake</a>
                <a className="btn-ghost inline-block" href="/attorneys/apply">For Attorneys</a>
              </div>
            </div>
            <div className="relative h-96 lg:h-full min-h-96">
              <Image
                src="/logo.png"
                alt="Legal Connect Interface"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </section>

        {/* The Problem */}
        <section className="site-container py-16">
          <h2 className="text-4xl font-semibold mb-6">The Problem</h2>
          <p className="text-lg text-lctextsecondary max-w-2xl leading-relaxed">People lose time and access to lawyers due to referral friction and slow intake. Attorneys struggle with inconsistent conflict checks and manual processes. Legal Connect reduces that friction with an intentional, automated workflow that prioritizes privacy and speed.</p>
        </section>

        {/* How It Works */}
        <section className="site-container py-16 border-t border-lcborder">
          <h2 className="text-4xl font-semibold mb-12">How Legal Connect Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '1', title: 'Describe', desc: 'Client enters case details in guided intake form' },
              { num: '2', title: 'Screen', desc: 'Automated conflict check runs instantly' },
              { num: '3', title: 'Match', desc: 'Available attorneys listed in real time' },
              { num: '4', title: 'Connect', desc: 'Secure messaging begins immediately' }
            ].map((step) => (
              <div key={step.num} className="">
                <div className="text-3xl font-semibold text-lcaccent mb-3">{step.num}</div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-lctextsecondary text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why We're Different */}
        <section className="site-container py-16 border-t border-lcborder">
          <h2 className="text-4xl font-semibold mb-12">Why Legal Connect Is Different</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Traditional Referral Systems</h3>
              <ul className="space-y-3 text-lctextsecondary">
                <li className="flex gap-3"><span className="text-red-500 flex-shrink-0"><FileText size={20} strokeWidth={3} /></span> <span>Manual intake processes</span></li>
                <li className="flex gap-3"><span className="text-red-500 flex-shrink-0"><AlertCircle size={20} strokeWidth={3} /></span> <span>Inconsistent conflict checks</span></li>
                <li className="flex gap-3"><span className="text-red-500 flex-shrink-0"><Clock size={20} strokeWidth={3} /></span> <span>Long wait times</span></li>
                <li className="flex gap-3"><span className="text-red-500 flex-shrink-0"><Eye size={20} strokeWidth={3} /></span> <span>Opaque referral delivery</span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-4">Legal Connect</h3>
              <ul className="space-y-3 text-lctextsecondary">
                <li className="flex gap-3"><span className="text-lcaccent flex-shrink-0"><CheckCircle2 size={20} strokeWidth={3} /></span> <span>Automated conflict screening</span></li>
                <li className="flex gap-3"><span className="text-lcaccent flex-shrink-0"><CheckCircle2 size={20} strokeWidth={3} /></span> <span>Transparent matching</span></li>
                <li className="flex gap-3"><span className="text-lcaccent flex-shrink-0"><CheckCircle2 size={20} strokeWidth={3} /></span> <span>Fast secure messaging</span></li>
                <li className="flex gap-3"><span className="text-lcaccent flex-shrink-0"><CheckCircle2 size={20} strokeWidth={3} /></span> <span>Client data control</span></li>
              </ul>
            </div>
          </div>
        </section>

        {/* Security & Privacy */}
        <section className="site-container py-16 border-t border-lcborder">
          <h2 className="text-4xl font-semibold mb-8">Security & Privacy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="">
              <div className="text-lcaccent mb-4"><Lock size={40} strokeWidth={1.5} /></div>
              <h3 className="text-lg font-semibold mb-2">Encrypted Communications</h3>
              <p className="text-lctextsecondary text-sm leading-relaxed">End-to-end encryption for all messages and file transfers</p>
            </div>
            <div className="">
              <div className="text-lcaccent mb-4"><CheckCircle2 size={40} strokeWidth={1.5} /></div>
              <h3 className="text-lg font-semibold mb-2">Automated Conflict Checks</h3>
              <p className="text-lctextsecondary text-sm leading-relaxed">No attorney conflicts. Party names hashed before transmission</p>
            </div>
            <div className="">
              <div className="text-lcaccent mb-4"><Shield size={40} strokeWidth={1.5} /></div>
              <h3 className="text-lg font-semibold mb-2">Client Control</h3>
              <p className="text-lctextsecondary text-sm leading-relaxed">Users control their data. No unnecessary human access</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-container border-t border-lcborder mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between py-8">
          <div className="text-sm text-lctextsecondary">© {new Date().getFullYear()} Legal Connect. All rights reserved.</div>
          <div className="flex items-center gap-6 text-sm text-lctextsecondary mt-4 md:mt-0">
            <a href="/privacy" className="hover:text-lctextprimary transition">Privacy Policy</a>
            <a href="/terms" className="hover:text-lctextprimary transition">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
