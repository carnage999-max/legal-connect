'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Spinner } from '@/components/ui/Spinner';

export default function DeleteAccountPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [platform, setPlatform] = useState<'android' | 'ios' | 'web' | 'other'>('android');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/account-deletion-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, reason, details, platform }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Request failed');
      }
      setSuccess(true);
      setEmail('');
      setName('');
      setReason('');
      setDetails('');
      setPlatform('android');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-paper">
        <div className="site-container py-12 md:py-16">
          <h1 className="title-1">Request account deletion</h1>
          <p className="lede mt-4">
            Ask us to delete your account and the data tied to it. You do not need to be signed in. We verify ownership by
            email before anything is removed.
          </p>
        </div>
      </div>

      <div className="site-container py-12 md:py-16">
        <form onSubmit={onSubmit} className="card mx-auto max-w-2xl space-y-5 p-6 sm:p-8">
          <div>
            <label htmlFor="del-email" className="label">Email address *</label>
            <input id="del-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="field" />
          </div>

          <div>
            <label htmlFor="del-name" className="label">Full name</label>
            <input id="del-name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="field" />
          </div>

          <div>
            <label htmlFor="del-platform" className="label">Where did you use Legal Connect?</label>
            <select id="del-platform" value={platform} onChange={(e) => setPlatform(e.target.value as any)} className="field">
              <option value="android">Android (Google Play)</option>
              <option value="ios">iOS (App Store)</option>
              <option value="web">Web</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="del-reason" className="label">Reason (optional)</label>
            <input id="del-reason" type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Optional reason" className="field" />
          </div>

          <div>
            <label htmlFor="del-details" className="label">Additional details</label>
            <textarea id="del-details" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Anything that helps us find your account, such as a phone number on file." rows={4} className="field" />
          </div>

          <p className="text-sm text-mute">
            We will send a confirmation email to verify ownership before final deletion. You can also reach us at{' '}
            <a href="mailto:support@legalconnectapp.com" className="font-medium text-blue-600 underline underline-offset-2">support@legalconnectapp.com</a>.
          </p>

          {error ? (
            <div role="alert" className="notice notice-error">
              <AlertCircle size={18} className="mt-0.5 flex-none" />
              {error}
            </div>
          ) : null}
          {success ? (
            <div role="status" className="notice notice-success">
              <CheckCircle2 size={18} className="mt-0.5 flex-none" />
              Request received. Please check your email.
            </div>
          ) : null}

          <button type="submit" disabled={submitting} className="btn btn-danger btn-lg w-full">
            {submitting && <Spinner />}
            {submitting ? 'Submitting…' : 'Submit request'}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}
