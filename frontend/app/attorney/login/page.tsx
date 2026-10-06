"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { AlertCircle, CalendarCheck, Inbox, Mail, MessageSquare } from 'lucide-react';
import { IconField } from '@/components/ui/IconField';
import { AuthShell } from '@/components/AuthShell';
import { PasswordField } from '@/components/ui/PasswordField';
import { Spinner } from '@/components/ui/Spinner';

export default function AttorneyLoginPage(): React.ReactNode {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(formData.username, formData.password);
      router.push('/app/attorney/dashboard');
    } catch (e: any) {
      setError(e.data?.detail || 'Login failed. Check your credentials.');
    }
  }

  return (
    <AuthShell
      variant="attorney"
      title="Welcome, Counselor"
      subtitle="Access your referrals, clients, appointments and billing."
      asideTitle="Screened matters, ready for your review."
      asidePoints={[
        { icon: Inbox, text: 'New requests arrive with structured details' },
        { icon: CalendarCheck, text: 'Accept or decline on your schedule' },
        { icon: MessageSquare, text: 'Message clients without leaving the platform' },
      ]}
      asideImage={{
        src: '/attorney-with-client.jpeg',
        alt: 'An attorney speaking with a client, with a network of attorney profiles and the Legal Connect logo beside them.',
      }}
      footer={
        <>
          <p>
            Not a member yet?{' '}
            <Link href="/attorneys/apply" className="font-semibold text-blue-400 hover:underline">
              Apply to join Legal Connect
            </Link>
          </p>
          <p>
            Looking for legal help?{' '}
            <Link href="/login" className="font-semibold text-blue-400 hover:underline">
              Client sign in
            </Link>
          </p>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && (
          <div role="alert" className="notice notice-error">
            <AlertCircle size={18} className="mt-0.5 flex-none" />
            {error}
          </div>
        )}

        <IconField
          label="Email address"
          icon={Mail}
          id="username"
          type="text"
          inputMode="email"
          autoComplete="username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          placeholder="you@firm.com"
        />

        <PasswordField
          label="Password"
          autoComplete="current-password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Your password"
        />

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-semibold text-blue-400 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={loading} className="btn btn-blue btn-lg w-full">
          {loading && <Spinner />}
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  );
}
