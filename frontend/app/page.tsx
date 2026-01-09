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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-lctextprimary">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-lcborder shadow-sm">
        <div className="site-container py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <img src="/logo.png" alt="Legal Connect" className="h-8 w-8" />
              <span className="font-bold text-xl" style={{ color: '#065F46' }}>Legal Connect</span>
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
        <section className="site-container py-16 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Logo prominent on mobile */}
            <div className="flex lg:hidden justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-lcaccent-client/20 to-lcaccent-attorney/20 rounded-full blur-2xl"></div>
                <img src="/logo.png" alt="Legal Connect" className="h-32 w-32 relative z-10" />
              </div>
            </div>
            
            <div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl leading-tight font-bold mb-6" style={{ color: '#111827' }}>
                Legal help when you need it.
              </h1>
              <p className="text-lg md:text-xl text-lctextsecondary mb-10 leading-relaxed font-light">
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
                    borderRadius: '8px',
                    padding: '0.875rem 1.5rem',
                    fontWeight: '600',
                    fontSize: '1rem',
                    textDecoration: 'none',
                    border: '2px solid #D1D5F7',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(49, 46, 129, 0.1)'
                  }} 
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#D1D5F7';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(49, 46, 129, 0.2)';
                  }} 
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#E0E7FF';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(49, 46, 129, 0.1)';
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
              <div className="absolute inset-0 bg-gradient-to-r from-lcaccent-client/15 via-lcaccent/15 to-lcaccent-attorney/15 rounded-3xl blur-3xl"></div>
              <div className="relative z-10 p-8 bg-white/50 backdrop-blur rounded-3xl shadow-lg">
                <img 
                  src="/logo.png"
                  alt="Legal Connect" 
                  className="h-72 w-72"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Why We Started This - The Problem Section */}
        <section className="bg-gradient-to-r from-slate-50 to-blue-50 border-y border-lcborder py-20 md:py-32">
          <div className="site-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
              <div>
                <h2 className="text-5xl md:text-6xl font-bold mb-6">Why We Started Legal Connect</h2>
                <p className="text-xl text-lctextsecondary max-w-2xl">The legal system wasn't designed with your needs in mind</p>
              </div>
              <div className="hidden lg:flex justify-center">
                <Image
                  src="/law-firm-building.png"
                  alt="Law Firm Building"
                  width={400}
                  height={300}
                  className="rounded-lg shadow-lg"
                  priority={false}
                />
              </div>
            </div>
            <div className="max-w-3xl mx-auto">
              <div className="space-y-6 text-lg text-lctextsecondary leading-relaxed font-light">
                <p>
                  At certain times in your life, you're going to need an attorney—whether it's for a contract, a lease, estate planning, or a complex criminal matter. Time is of the essence.
                </p>
                <p>
                  We did what many people do: we paid a Bar Association a $25 referral fee for them to give us three names of attorneys who either weren't taking new clients or had a conflict of interest. We got nothing for our money.
                </p>
                <p>
                  Do you have time to Google lawyers and call 150 of them, going through intakes with each one to find a single attorney to help you with your will? Neither did we.
                </p>
                <p className="text-lg font-semibold text-lcaccent-client text-center py-4">
                  So we did something about it.
                </p>
                <p>
                  Welcome to the future of legal care. Legal Connect automates what should never have been manual, giving you direct access to qualified attorneys in minutes, not weeks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="site-container py-20 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">How Legal Connect Works</h2>
            <p className="text-xl text-lctextsecondary max-w-2xl mx-auto">Get matched with a qualified attorney in just four simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: '1', title: 'Describe', desc: 'Client enters case details in guided intake form', icon: FileText },
              { num: '2', title: 'Screen', desc: 'Automated conflict check runs instantly', icon: Shield },
              { num: '3', title: 'Match', desc: 'Available attorneys listed in real time', icon: CheckCircle2 },
              { num: '4', title: 'Connect', desc: 'Secure messaging begins immediately', icon: Lock }
            ].map((step, i) => (
              <div key={step.num} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-lcaccent-client/5 to-lcaccent-attorney/5 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative bg-white border border-lcborder rounded-xl p-8 hover:border-lcaccent/30 hover:shadow-lg transition duration-300">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-4xl font-bold text-lcaccent flex-shrink-0">{step.num}</div>
                    <step.icon className="text-lcaccent-client mt-1" size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-lctextsecondary leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why We're Different */}
        <section className="site-container py-20 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">Why Legal Connect Is Different</h2>
            <p className="text-xl text-lctextsecondary max-w-2xl mx-auto">See how we're revolutionizing access to legal services</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
            <div className="hidden lg:flex lg:col-span-1 justify-center items-center">
              <Image
                src="/scales-of-justice.png"
                alt="Scales of Justice"
                width={300}
                height={300}
                className="rounded-lg shadow-lg"
                priority={false}
              />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <span className="text-3xl">❌</span> Traditional Referral Systems
                </h3>
                <div className="bg-red-50/50 border border-red-200/50 rounded-2xl p-10 backdrop-blur-sm">
                  <ul className="space-y-5 text-red-800">
                    <li className="flex gap-4 items-start">
                      <span className="text-red-500 flex-shrink-0 mt-1 font-bold">•</span>
                      <span className="font-medium">Manual intake processes that waste your time</span>
                    </li>
                    <li className="flex gap-4 items-start">
                      <span className="text-red-500 flex-shrink-0 mt-1 font-bold">•</span>
                      <span className="font-medium">Inconsistent conflict checks with no transparency</span>
                    </li>
                    <li className="flex gap-4 items-start">
                      <span className="text-red-500 flex-shrink-0 mt-1 font-bold">•</span>
                      <span className="font-medium">Long wait times and endless follow-ups</span>
                    </li>
                    <li className="flex gap-4 items-start">
                      <span className="text-red-500 flex-shrink-0 mt-1 font-bold">•</span>
                      <span className="font-medium">Opaque referral delivery with no guarantees</span>
                    </li>
                    <li className="flex gap-4 items-start">
                      <span className="text-red-500 flex-shrink-0 mt-1 font-bold">•</span>
                      <span className="font-medium">Pay fees regardless of results</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <span className="text-3xl">✓</span> Legal Connect
                </h3>
                <div className="bg-green-50/50 border border-green-200/50 rounded-2xl p-10 backdrop-blur-sm">
                  <ul className="space-y-5 text-green-800">
                    <li className="flex gap-4 items-start">
                      <CheckCircle2 size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="font-medium">Automated conflict screening in seconds</span>
                    </li>
                    <li className="flex gap-4 items-start">
                      <CheckCircle2 size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="font-medium">Transparent matching with real-time results</span>
                    </li>
                    <li className="flex gap-4 items-start">
                      <CheckCircle2 size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="font-medium">Fast secure messaging that actually works</span>
                    </li>
                    <li className="flex gap-4 items-start">
                      <CheckCircle2 size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="font-medium">You stay in control of your data</span>
                    </li>
                    <li className="flex gap-4 items-start">
                      <CheckCircle2 size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="font-medium">Direct access to qualified attorneys</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Privacy */}
        <section className="bg-gradient-to-r from-slate-50 via-slate-50 to-blue-50 border-y border-lcborder py-20 md:py-32">
          <div className="site-container">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold mb-6">Enterprise-Grade Security</h2>
              <p className="text-xl text-lctextsecondary max-w-2xl mx-auto">Your data protection is our top priority</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="hidden lg:flex justify-center">
                <Image
                  src="/lady-justice-statue.png"
                  alt="Lady Justice"
                  width={350}
                  height={350}
                  className="rounded-lg shadow-lg"
                  priority={false}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white border border-lcborder rounded-2xl p-8 hover:shadow-lg transition hover:border-lcaccent/30 text-center group">
                  <div className="text-lcaccent mb-6 flex justify-center group-hover:scale-110 transition transform">
                    <Lock size={56} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Encrypted Communications</h3>
                  <p className="text-lctextsecondary leading-relaxed">End-to-end encryption for all messages and file transfers between clients and attorneys</p>
                </div>
                <div className="bg-white border border-lcborder rounded-2xl p-8 hover:shadow-lg transition hover:border-lcaccent/30 text-center group">
                  <div className="text-lcaccent-client mb-6 flex justify-center group-hover:scale-110 transition transform">
                    <CheckCircle2 size={56} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Conflict Screening</h3>
                  <p className="text-lctextsecondary leading-relaxed">Automated conflict checks with no attorney conflicts. Party names hashed before transmission</p>
                </div>
              </div>
            </div>
            <div className="mt-12 bg-white border border-lcborder rounded-2xl p-8 hover:shadow-lg transition hover:border-lcaccent/30 text-center">
              <div className="text-lcaccent-attorney mb-6 flex justify-center group-hover:scale-110 transition transform">
                <Shield size={56} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Your Data, Your Control</h3>
              <p className="text-lctextsecondary leading-relaxed">You control your data. No unnecessary human access or third-party sharing</p>
            </div>
          </div>
        </section>

        {/* App Store Links */}
        <section className="site-container py-20 md:py-32">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">Download Our Mobile App</h2>
            <p className="text-xl text-lctextsecondary max-w-2xl mx-auto">Access Legal Connect anywhere, anytime</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-2xl mx-auto">
            <a 
              href="#" 
              className="bg-black text-white rounded-xl px-8 py-4 flex items-center gap-4 hover:bg-gray-800 transition w-full sm:w-auto justify-center transform hover:-translate-y-1 shadow-lg"
              title="Coming soon to App Store"
            >
              <Apple size={32} />
              <div className="text-left">
                <div className="text-xs text-gray-400">Download on</div>
                <div className="text-lg font-semibold">App Store</div>
              </div>
            </a>
            <a 
              href="#" 
              className="bg-black text-white rounded-xl px-8 py-4 flex items-center gap-4 hover:bg-gray-800 transition w-full sm:w-auto justify-center transform hover:-translate-y-1 shadow-lg"
              title="Coming soon to Google Play"
            >
              <Smartphone size={32} />
              <div className="text-left">
                <div className="text-xs text-gray-400">Get it on</div>
                <div className="text-lg font-semibold">Google Play</div>
              </div>
            </a>
          </div>
          <p className="text-center text-sm text-lctextsecondary mt-8">Mobile apps coming soon. Use the web platform for full access now.</p>
        </section>
      </main>
    </div>
  );
}
