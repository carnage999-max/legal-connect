'use client';
import { Shield, CheckCircle2, Lock, AlertCircle, Clock, Eye, FileText, Apple, Smartphone, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-lctextprimary">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-lcborder shadow-sm">
        <div className="site-container py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <img src="/logo.png" alt="Legal Connect" className="h-8 w-8" />
              <span className="font-bold text-xl bg-gradient-to-r from-lcaccent-client to-lcaccent-attorney bg-clip-text text-transparent">Legal Connect</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
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
            {/* Mobile menu button placeholder */}
            <div className="md:hidden">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="site-container py-12 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Logo prominent on mobile */}
            <div className="flex lg:hidden justify-center mb-4">
              <img src="/logo.png" alt="Legal Connect" className="h-20 w-20" />
            </div>
            
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight font-bold mb-6 bg-gradient-to-r from-lcaccent-client via-lcaccent to-lcaccent-attorney bg-clip-text text-transparent">
                Legal help when you need it.
              </h1>
              <p className="text-lg md:text-xl text-lctextsecondary mb-8 leading-relaxed">
                Describe your legal issue once. Our system runs automated conflict screening, matches available attorneys in real time, and starts secure communication immediately.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
                <a 
                  className="btn-primary inline-flex items-center justify-center gap-2 group"
                  href="/intake"
                >
                  Start Legal Intake
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
                </a>
                <a 
                  style={{
                    color: '#312E81',
                    backgroundColor: '#E0E7FF',
                    borderRadius: '6px',
                    padding: '12px 20px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    border: '2px solid #D1D5F7',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    justifyContent: 'center'
                  }} 
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#D1D5F7';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }} 
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#E0E7FF';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }} 
                  href="/attorneys/apply"
                >
                  For Attorneys
                  <ArrowRight size={18} />
                </a>
              </div>
            </div>
            
            {/* Logo on desktop */}
            <div className="hidden lg:flex relative h-96 lg:h-full min-h-96 items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-lcaccent-client/10 via-lcaccent/10 to-lcaccent-attorney/10 rounded-3xl blur-3xl"></div>
              <img 
                src="/logo.png"
                alt="Legal Connect" 
                className="h-64 w-64 relative z-10"
              />
            </div>
          </div>
        </section>

        {/* Why We Started This - The Problem Section */}
        <section className="bg-white border-y border-lcborder py-16 md:py-24">
          <div className="site-container">
            <h2 className="text-4xl font-bold mb-8 text-center">Why We Started Legal Connect</h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-lctextsecondary leading-relaxed mb-6">
                At certain times in your life, you're going to need an attorney—whether it's for a contract, a lease, estate planning, or a complex criminal matter. Time is of the essence.
              </p>
              <p className="text-lg text-lctextsecondary leading-relaxed mb-6">
                We did what many people do: we paid a Bar Association a $25 referral fee for them to give us three names of attorneys who either weren't taking new clients or had a conflict of interest. We got nothing for our money.
              </p>
              <p className="text-lg text-lctextsecondary leading-relaxed mb-6">
                Do you have time to Google lawyers and call 150 of them, going through intakes with each one to find a single attorney to help you with your will? Neither did we.
              </p>
              <p className="text-lg font-semibold text-lcaccent mb-6">
                So we did something about it.
              </p>
              <p className="text-lg text-lctextsecondary leading-relaxed">
                Welcome to the future of legal care. Legal Connect automates what should never have been manual, giving you direct access to qualified attorneys in minutes, not weeks.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="site-container py-16 md:py-24">
          <h2 className="text-4xl font-bold mb-12 text-center">How Legal Connect Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '1', title: 'Describe', desc: 'Client enters case details in guided intake form', icon: FileText },
              { num: '2', title: 'Screen', desc: 'Automated conflict check runs instantly', icon: Shield },
              { num: '3', title: 'Match', desc: 'Available attorneys listed in real time', icon: CheckCircle2 },
              { num: '4', title: 'Connect', desc: 'Secure messaging begins immediately', icon: Lock }
            ].map((step, i) => (
              <div key={step.num} className="bg-white border border-lcborder rounded-lg p-6 hover:shadow-lg transition hover:border-lcaccent/50">
                <div className="flex items-start gap-4">
                  <div className="text-3xl font-bold text-lcaccent flex-shrink-0">{step.num}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-lctextsecondary text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why We're Different */}
        <section className="site-container py-16 md:py-24">
          <h2 className="text-4xl font-bold mb-12 text-center">Why Legal Connect Is Different</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <h3 className="text-2xl font-semibold mb-6 text-red-900">Traditional Referral Systems</h3>
              <ul className="space-y-4 text-red-800">
                <li className="flex gap-3"><span className="text-red-500 flex-shrink-0 mt-1"><FileText size={20} strokeWidth={3} /></span> <span className="font-medium">Manual intake processes that waste your time</span></li>
                <li className="flex gap-3"><span className="text-red-500 flex-shrink-0 mt-1"><AlertCircle size={20} strokeWidth={3} /></span> <span className="font-medium">Inconsistent conflict checks with no transparency</span></li>
                <li className="flex gap-3"><span className="text-red-500 flex-shrink-0 mt-1"><Clock size={20} strokeWidth={3} /></span> <span className="font-medium">Long wait times and endless follow-ups</span></li>
                <li className="flex gap-3"><span className="text-red-500 flex-shrink-0 mt-1"><Eye size={20} strokeWidth={3} /></span> <span className="font-medium">Opaque referral delivery with no guarantees</span></li>
              </ul>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-8">
              <h3 className="text-2xl font-semibold mb-6 text-green-900">Legal Connect</h3>
              <ul className="space-y-4 text-green-800">
                <li className="flex gap-3"><span className="text-lcaccent flex-shrink-0 mt-1"><CheckCircle2 size={20} strokeWidth={3} /></span> <span className="font-medium">Automated conflict screening in seconds</span></li>
                <li className="flex gap-3"><span className="text-lcaccent flex-shrink-0 mt-1"><CheckCircle2 size={20} strokeWidth={3} /></span> <span className="font-medium">Transparent matching with real-time results</span></li>
                <li className="flex gap-3"><span className="text-lcaccent flex-shrink-0 mt-1"><CheckCircle2 size={20} strokeWidth={3} /></span> <span className="font-medium">Fast secure messaging that actually works</span></li>
                <li className="flex gap-3"><span className="text-lcaccent flex-shrink-0 mt-1"><CheckCircle2 size={20} strokeWidth={3} /></span> <span className="font-medium">You stay in control of your data</span></li>
              </ul>
            </div>
          </div>
        </section>

        {/* Security & Privacy */}
        <section className="bg-slate-50 border-y border-lcborder py-16 md:py-24">
          <div className="site-container">
            <h2 className="text-4xl font-bold mb-12 text-center">Enterprise-Grade Security</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white border border-lcborder rounded-lg p-8 text-center hover:shadow-lg transition">
                <div className="text-lcaccent mb-4 flex justify-center"><Lock size={48} strokeWidth={1.5} /></div>
                <h3 className="text-lg font-semibold mb-2">Encrypted Communications</h3>
                <p className="text-lctextsecondary text-sm leading-relaxed">End-to-end encryption for all messages and file transfers between clients and attorneys</p>
              </div>
              <div className="bg-white border border-lcborder rounded-lg p-8 text-center hover:shadow-lg transition">
                <div className="text-lcaccent mb-4 flex justify-center"><CheckCircle2 size={48} strokeWidth={1.5} /></div>
                <h3 className="text-lg font-semibold mb-2">Conflict Screening</h3>
                <p className="text-lctextsecondary text-sm leading-relaxed">Automated conflict checks with no attorney conflicts. Party names hashed before transmission</p>
              </div>
              <div className="bg-white border border-lcborder rounded-lg p-8 text-center hover:shadow-lg transition">
                <div className="text-lcaccent mb-4 flex justify-center"><Shield size={48} strokeWidth={1.5} /></div>
                <h3 className="text-lg font-semibold mb-2">Your Data, Your Control</h3>
                <p className="text-lctextsecondary text-sm leading-relaxed">You control your data. No unnecessary human access or third-party sharing</p>
              </div>
            </div>
          </div>
        </section>

        {/* App Store Links */}
        <section className="site-container py-16 md:py-24">
          <h2 className="text-4xl font-bold mb-12 text-center">Download Our Mobile App</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-2xl mx-auto">
            <a 
              href="#" 
              className="bg-black text-white rounded-lg px-6 py-3 flex items-center gap-3 hover:bg-gray-800 transition w-full sm:w-auto justify-center"
              title="Coming soon to App Store"
            >
              <Apple size={24} />
              <div className="text-left">
                <div className="text-xs text-gray-400">Download on</div>
                <div className="text-lg font-semibold">App Store</div>
              </div>
            </a>
            <a 
              href="#" 
              className="bg-black text-white rounded-lg px-6 py-3 flex items-center gap-3 hover:bg-gray-800 transition w-full sm:w-auto justify-center"
              title="Coming soon to Google Play"
            >
              <Smartphone size={24} />
              <div className="text-left">
                <div className="text-xs text-gray-400">Get it on</div>
                <div className="text-lg font-semibold">Google Play</div>
              </div>
            </a>
          </div>
          <p className="text-center text-sm text-lctextsecondary mt-6">Mobile apps coming soon. Use the web platform for full access now.</p>
        </section>
      </main>
    </div>
  );
}
