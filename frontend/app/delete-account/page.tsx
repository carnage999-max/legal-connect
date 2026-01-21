'use client';

import { useState } from 'react';

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: '#f8fafc' }}>
      <div style={{ width: '100%', maxWidth: 560, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Request Account Deletion</h1>
        <p style={{ color: '#64748b', marginBottom: 16 }}>
          Use this form to request deletion of your account and associated data. You do not need to be signed in. We will verify ownership via email before processing.
        </p>

        <form onSubmit={onSubmit}>
          <label style={{ display: 'block', fontWeight: 600, marginTop: 8 }}>Email Address *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={inputStyle}
          />

          <label style={{ display: 'block', fontWeight: 600, marginTop: 8 }}>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={inputStyle}
          />

          <label style={{ display: 'block', fontWeight: 600, marginTop: 8 }}>Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value as any)} style={{ ...inputStyle, height: 44 }}>
            <option value="android">Android (Google Play)</option>
            <option value="ios">iOS (App Store)</option>
            <option value="web">Web</option>
            <option value="other">Other</option>
          </select>

          <label style={{ display: 'block', fontWeight: 600, marginTop: 8 }}>Reason</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Optional reason"
            style={inputStyle}
          />

          <label style={{ display: 'block', fontWeight: 600, marginTop: 8 }}>Additional Details</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Any extra information to help us locate your account (e.g., phone number on file)."
            rows={4}
            style={{ ...inputStyle, height: 120 }}
          />

          <p style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>
            We will send a confirmation email to verify account ownership before final deletion. You can also reach us at
            {' '}<a href="mailto:support@ultimateapartmentmanager.com">support@ultimateapartmentmanager.com</a>.
          </p>

          {error ? <div style={{ color: '#ef4444', marginTop: 8 }}>{error}</div> : null}
          {success ? <div style={{ color: '#16a34a', marginTop: 8 }}>Request received. Please check your email.</div> : null}

          <button type="submit" disabled={submitting} style={buttonStyle}>
            {submitting ? 'Submitting…' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#f1f5f9',
  padding: 12,
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  color: '#0f172a',
  marginTop: 4,
};

const buttonStyle: React.CSSProperties = {
  marginTop: 16,
  width: '100%',
  backgroundColor: '#0f172a',
  color: '#fff',
  padding: '12px 16px',
  borderRadius: 10,
  border: 'none',
  fontWeight: 700,
  cursor: 'pointer',
};

