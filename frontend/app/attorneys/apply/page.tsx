"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Briefcase, CheckCircle2, Lock, Zap } from 'lucide-react';
import { apiPost } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Spinner } from '@/components/ui/Spinner';

export default function AttorneysApplyPage(): React.ReactNode {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    bar_license: '',
    jurisdiction: '',
    practice_areas: [] as string[],
    years_experience: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const practiceAreaOptions = ['Civil', 'Criminal', 'Family', 'Corporate', 'Intellectual Property', 'Other'];

  function togglePracticeArea(area: string) {
    setFormData(prev => ({
      ...prev,
      practice_areas: prev.practice_areas.includes(area)
        ? prev.practice_areas.filter(a => a !== area)
        : [...prev.practice_areas, area]
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.bar_license) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await apiPost('/api/v1/attorneys/', formData);
      setSuccess('Application submitted! Check your email for next steps.');
      setTimeout(() => router.push('/'), 2000);
    } catch (e: any) {
      setError(e.data?.detail || e.data?.non_field_errors?.[0] || 'Failed to submit application');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const benefits = [
    { icon: Briefcase, title: 'Quality referrals', text: 'Only conflict-free matches in your practice areas and jurisdictions.' },
    { icon: Lock, title: 'Automated conflict check', text: 'Our system screens for conflicts before a referral reaches you.' },
    { icon: Zap, title: 'Accept or decline', text: 'You decide within 24 hours. No pressure, no obligations.' },
  ];

  const steps = [
    { title: 'Complete your profile', text: 'Tell us about your experience, practice areas and jurisdictions. Set your rates and availability.' },
    { title: 'Receive referrals', text: 'When a conflict-free match is made, you get a notification with client info and matter details.' },
    { title: 'Accept and engage', text: 'Review the referral and accept it. We connect you with the client, and you take it from there.' },
  ];

  return (
    <>
      <Navbar />

      <section className="dark-surface hero-bg relative isolate overflow-hidden text-white">
        <div className="site-container py-16 md:py-24">
          <p className="eyebrow">For attorneys</p>
          <h1 className="title-1 mt-4 max-w-3xl">Join our attorney network.</h1>
          <p className="lede mt-5">Get quality referrals while we handle the intake and matching.</p>
          <div className="mt-8">
            <a href="#apply" className="btn btn-primary btn-lg">
              Start your application
            </a>
          </div>
        </div>
      </section>

      <div className="site-container grid gap-12 py-14 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:py-20">
        <div className="space-y-12">
          <ul className="space-y-4">
            {benefits.map(({ icon: Icon, title, text }) => (
              <li key={title} className="card flex items-start gap-4 p-6">
                <Icon size={26} strokeWidth={1.6} className="mt-0.5 flex-none text-mute" />
                <div>
                  <h2 className="title-3">{title}</h2>
                  <p className="mt-1 text-[0.95rem] leading-relaxed text-mute">{text}</p>
                </div>
              </li>
            ))}
          </ul>

          <div>
            <h2 className="title-2">How it works</h2>
            <ol className="mt-6 space-y-6">
              {steps.map((st, i) => (
                <li key={st.title} className="flex gap-4">
                  <span className="tnum w-6 flex-none pt-0.5 text-2xl font-semibold tracking-tight text-mute">{i + 1}</span>
                  <div>
                    <h3 className="title-3">{st.title}</h3>
                    <p className="mt-1 text-[0.97rem] leading-relaxed text-mute">{st.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="notice notice-info !block rounded-2xl p-6">
            <h2 className="title-3">Fee structure</h2>
            <p className="mt-2 text-[0.97rem] leading-relaxed">
              Legal Connect charges a referral fee on successful matter engagements. No upfront costs or monthly
              subscriptions.
            </p>
            <p className="mt-2 text-sm opacity-80">
              Detailed fee information is provided during your onboarding and approval process.
            </p>
          </div>
        </div>

        <div id="apply" className="lg:sticky lg:top-24 lg:self-start">
          <form onSubmit={handleSubmit} className="card space-y-5 p-6 sm:p-8" noValidate>
            <div>
              <h2 className="title-2">Attorney application</h2>
              <p className="mt-2 text-[0.95rem] text-mute">Fields marked * are required. Already a member? <Link href="/attorney/login" className="font-semibold text-blue-600 hover:underline">Sign in</Link>.</p>
            </div>

            {error && (
              <div role="alert" className="notice notice-error">
                <AlertCircle size={18} className="mt-0.5 flex-none" />
                {error}
              </div>
            )}
            {success && (
              <div role="status" className="notice notice-success">
                <CheckCircle2 size={18} className="mt-0.5 flex-none" />
                {success}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="first_name" className="label">First name *</label>
                <input id="first_name" type="text" autoComplete="given-name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} placeholder="John" className="field" />
              </div>
              <div>
                <label htmlFor="last_name" className="label">Last name *</label>
                <input id="last_name" type="text" autoComplete="family-name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} placeholder="Doe" className="field" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="label">Email address *</label>
              <input id="email" type="email" autoComplete="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john.doe@example.com" className="field" />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="bar_license" className="label">Bar license *</label>
                <input id="bar_license" type="text" value={formData.bar_license} onChange={(e) => setFormData({ ...formData, bar_license: e.target.value })} placeholder="e.g. CA123456" className="field" />
              </div>
              <div>
                <label htmlFor="jurisdiction" className="label">Primary jurisdiction</label>
                <select id="jurisdiction" value={formData.jurisdiction} onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })} className="field">
                  <option value="">Select your state…</option>
                  <option value="CA">California</option>
                  <option value="NY">New York</option>
                  <option value="TX">Texas</option>
                  <option value="FL">Florida</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="years_experience" className="label">Years of experience</label>
              <select id="years_experience" value={formData.years_experience} onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })} className="field">
                <option value="">Select experience level…</option>
                <option value="0-2">0-2 years</option>
                <option value="2-5">2-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>

            <fieldset>
              <legend className="label">Practice areas</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {practiceAreaOptions.map((area) => (
                  <label key={area} className="choice">
                    <input type="checkbox" checked={formData.practice_areas.includes(area)} onChange={() => togglePracticeArea(area)} />
                    <span className="text-[0.95rem]">{area}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="bio" className="label">Professional bio</label>
              <textarea id="bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell us about your background and expertise…" rows={5} className="field" />
            </div>

            <button type="submit" disabled={loading} className="btn btn-blue btn-lg w-full">
              {loading && <Spinner />}
              {loading ? 'Submitting…' : 'Submit application'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
