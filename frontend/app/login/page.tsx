"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { AlertCircle, Briefcase, Clock, FileText, Mail, MessageSquare } from 'lucide-react';
import { IconField } from '@/components/ui/IconField';
import { AuthShell } from '@/components/AuthShell';
import { PasswordField } from '@/components/ui/PasswordField';
import { Spinner } from '@/components/ui/Spinner';

const LoginComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [tokenExpired, setTokenExpired] = useState(false);

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setTokenExpired(true);
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setTokenExpired(false);
    try {
      await login(formData.username, formData.password);
      router.push('/app/client/dashboard');
    } catch (e: any) {
      setError(e.data?.detail || 'Login failed. Check your credentials.');
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Access your matters, messages and payments securely."
      asideTitle="Your matter, picked up where you left it."
      asidePoints={[
        { icon: Briefcase, text: 'See where each matter stands' },
        { icon: MessageSquare, text: 'Message your attorney securely' },
        { icon: FileText, text: 'Keep your documents in one place' },
      ]}
      asideImage={{
        src: '/potential-client-browsing-legal-connect.jpeg',
        alt: 'Over the shoulder of a woman using a laptop that shows the Legal Connect steps: describe, screen, match and connect. Attorney profile photos are linked above.',
      }}
      footer={
        <>
          <p>
            New to Legal Connect?{' '}
            <Link href="/signup" className="font-semibold text-blue-600 hover:underline">
              Create an account
            </Link>
          </p>
          <p>
            Are you an attorney?{' '}
            <Link href="/attorney/login" className="font-semibold text-blue-600 hover:underline">
              Attorney sign in
            </Link>
          </p>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {tokenExpired && (
          <div role="status" className="notice notice-warn">
            <Clock size={18} className="mt-0.5 flex-none" />
            Your session has expired. Please sign in again.
          </div>
        )}
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
          placeholder="you@example.com"
        />

        <PasswordField
          label="Password"
          autoComplete="current-password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Your password"
        />

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-semibold text-blue-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
          {loading && <Spinner />}
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  );
};

export default dynamic(() => Promise.resolve(LoginComponent), { ssr: false });
