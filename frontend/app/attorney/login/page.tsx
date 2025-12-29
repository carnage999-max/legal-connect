"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

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
    <div className="min-h-screen bg-lcbgattorney text-lctextattorney">
      <header className="border-b border-lcborderattorney">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl hover:opacity-80 transition">
            <img src="/logo.png" alt="Legal Connect" className="h-8 w-8" />
            <span>Legal Connect</span>
          </Link>
          <p className="text-lctextattorneysecondary text-sm mt-1">Attorney Portal</p>
        </div>
      </header>

      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-semibold mb-3">Welcome, Counselor</h1>
          <p className="text-lg text-lctextattorneysecondary mb-8">Access your referrals, clients, appointments, and billing.</p>

          <form onSubmit={handleSubmit} className="space-y-5 mb-8">
            {error && <div className="p-4 bg-red-900 bg-opacity-30 border border-red-700 rounded-md text-red-300 text-sm font-medium">{error}</div>}

            <div>
              <label className="block text-sm font-semibold mb-2">Email Address</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-lcbgattorneysecondary border border-lcborderattorney rounded-md p-3 text-lctextattorney focus:outline-none focus:ring-2 focus:ring-offset-2 transition"
                style={{ outlineColor: '#6366F1' }}
                placeholder="you@attorney.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-lcbgattorneysecondary border border-lcborderattorney rounded-md p-3 text-lctextattorney focus:outline-none focus:ring-2 focus:ring-offset-2 transition"
                style={{ outlineColor: '#6366F1' }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lcaccentattorney text-white rounded-md py-3 font-semibold hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="space-y-4 border-t border-lcborderattorney pt-6">
            <div>
              <p className="text-lctextattorneysecondary text-sm mb-2">Don't have an account?</p>
              <Link href="/attorneys/apply" className="text-lcaccentattorney font-medium hover:underline">Apply to join Legal Connect</Link>
            </div>
            
            <div>
              <p className="text-lctextattorneysecondary text-sm mb-2">Are you a client?</p>
              <Link href="/login" className="text-lcaccentattorney font-medium hover:underline">Client login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
