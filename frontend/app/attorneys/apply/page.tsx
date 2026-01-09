"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Briefcase, Lock, Zap, CheckCircle2, Clock, Loader } from 'lucide-react';
import { apiPost } from '@/lib/api';

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

  return (
    <div className="min-h-screen bg-white text-lctextprimary">
      <header className="border-b border-lcborder">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <nav className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl hover:opacity-80 transition">
              <img src="/logo.png" alt="Legal Connect" className="h-8 w-8" />
              <span>Legal Connect</span>
            </Link>
            <Link href="/" className="text-lctextsecondary hover:text-lctextprimary transition">← Back</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-16">
            <div>
              <h1 className="text-5xl font-bold mb-4">Join Our Attorney Network</h1>
              <p className="text-2xl text-lctextsecondary mb-8">Get quality referrals while we handle the intake and matching.</p>
            </div>
            <div className="hidden lg:flex justify-center">
              <Image
                src="/law-firm-building.png"
                alt="Law Firm Building"
                width={350}
                height={280}
                className="rounded-lg shadow-lg"
                priority={false}
              />
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="p-6 bg-blue-50 rounded-lg border border-lcborder">
              <div className="text-lcaccent mb-3"><Briefcase size={32} strokeWidth={1.5} /></div>
              <h3 className="font-semibold text-lg mb-2">Quality Referrals</h3>
              <p className="text-lctextsecondary text-sm">Only conflict-free matches in your practice areas and jurisdictions.</p>
            </div>
            <div className="p-6 bg-blue-50 rounded-lg border border-lcborder">
              <div className="text-lcaccent mb-3"><Lock size={32} strokeWidth={1.5} /></div>
              <h3 className="font-semibold text-lg mb-2">Automated Conflict Check</h3>
              <p className="text-lctextsecondary text-sm">Our system verifies no conflicts before sending your way.</p>
            </div>
            <div className="p-6 bg-blue-50 rounded-lg border border-lcborder">
              <div className="text-lcaccent mb-3"><Zap size={32} strokeWidth={1.5} /></div>
              <h3 className="font-semibold text-lg mb-2">Accept or Decline</h3>
              <p className="text-lctextsecondary text-sm">You decide within 24 hours. No pressure, no obligations.</p>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8">How It Works</h2>
            <div className="space-y-6">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-lcaccent text-white font-bold">1</div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Complete Your Profile</h3>
                  <p className="text-lctextsecondary">Tell us about your experience, practice areas, and jurisdictions. Set your rates and availability.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-lcaccent text-white font-bold">2</div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Receive Referrals</h3>
                  <p className="text-lctextsecondary">When a conflict-free match is made, you'll get a notification with client info and matter details.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-lcaccent text-white font-bold">3</div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Accept & Engage</h3>
                  <p className="text-lctextsecondary">Review the referral and accept it. We'll connect you with the client, and you take it from there.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fee Structure */}
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-8 mb-16">
            <h2 className="text-2xl font-bold mb-4">Fee Structure</h2>
            <p className="text-lctextsecondary mb-4">Legal Connect charges a referral fee on successful matter engagements. No upfront costs or monthly subscriptions.</p>
            <p className="text-lctextsecondary text-sm">Detailed fee information will be provided during your onboarding and approval process.</p>
          </div>
        </div>

        {/* Application Form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white border-2 border-lcborder rounded-lg p-10 shadow-sm">
            <h2 className="text-3xl font-bold mb-8">Attorney Application</h2>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">{success}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2">First Name *</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="John"
                  className="w-full border border-lcborder rounded-lg p-3 text-lctextprimary focus:outline-none focus:ring-2 focus:border-lcaccent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Last Name *</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Doe"
                  className="w-full border border-lcborder rounded-lg p-3 text-lctextprimary focus:outline-none focus:ring-2 focus:border-lcaccent"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john.doe@example.com"
                className="w-full border border-lcborder rounded-lg p-3 text-lctextprimary focus:outline-none focus:ring-2 focus:border-lcaccent"
              />
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Bar License *</label>
                <input
                  type="text"
                  value={formData.bar_license}
                  onChange={(e) => setFormData({ ...formData, bar_license: e.target.value })}
                  placeholder="e.g., CA123456"
                  className="w-full border border-lcborder rounded-lg p-3 text-lctextprimary focus:outline-none focus:ring-2 focus:border-lcaccent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Primary Jurisdiction</label>
                <select
                  value={formData.jurisdiction}
                  onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                  className="w-full border border-lcborder rounded-lg p-3 text-lctextprimary focus:outline-none focus:ring-2 focus:border-lcaccent"
                >
                  <option value="">Select your state...</option>
                  <option value="CA">California</option>
                  <option value="NY">New York</option>
                  <option value="TX">Texas</option>
                  <option value="FL">Florida</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Years of Experience</label>
              <select
                value={formData.years_experience}
                onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                className="w-full border border-lcborder rounded-lg p-3 text-lctextprimary focus:outline-none focus:ring-2 focus:border-lcaccent"
              >
                <option value="">Select experience level...</option>
                <option value="0-2">0-2 years</option>
                <option value="2-5">2-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">Practice Areas</label>
              <div className="grid grid-cols-2 gap-3">
                {practiceAreaOptions.map(area => (
                  <label key={area} className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                    formData.practice_areas.includes(area)
                      ? 'border-lcaccent bg-blue-50'
                      : 'border-lcborder hover:border-lcaccent'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.practice_areas.includes(area)}
                      onChange={() => togglePracticeArea(area)}
                      className="mr-2 w-4 h-4"
                    />
                    <span className="text-sm font-medium text-lctextprimary">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-semibold mb-2">Professional Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about your background and expertise..."
                rows={5}
                className="w-full border border-lcborder rounded-lg p-3 text-lctextprimary focus:outline-none focus:ring-2 focus:border-lcaccent resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-lcaccent text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader size={20} className="animate-spin" />}
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
