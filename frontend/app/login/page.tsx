"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function ClientLoginPage(): React.ReactNode {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(formData.username, formData.password);
      router.push('/app/client/dashboard');
    } catch (e: any) {
      setError(e.data?.detail || 'Login failed. Check your credentials.');
    }
  }

  return (
    <div className="min-h-screen bg-white text-lctextprimary">
      <header className="border-b border-lcborder">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="font-bold text-2xl">Legal Connect</div>
        </div>
      </header>
      
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-semibold mb-3">Welcome back</h1>
          <p className="text-lg text-lctextsecondary mb-8">Access your matters, messages, and payments securely.</p>

        <form onSubmit={handleSubmit} className="space-y-5 mb-8">
          {error && <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm font-medium">{error}</div>}

          <div>
            <label className="block text-sm font-semibold mb-2">Email Address</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full border border-lcborder rounded-md p-3 text-lctextprimary focus:outline-none focus:ring-2 focus:ring-offset-2 transition"
              style={{ outlineColor: '#065F46' }}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full border border-lcborder rounded-md p-3 text-lctextprimary focus:outline-none focus:ring-2 focus:ring-offset-2 transition"
              style={{ outlineColor: '#065F46' }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lcaccent-client text-white rounded-md py-3 font-semibold hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="space-y-4 border-t border-lcborder pt-6">
          <div>
            <p className="text-lctextsecondary text-sm mb-2">Don't have an account?</p>
            <Link href="/signup" className="text-lcaccent-client font-medium hover:underline">Create one now</Link>
          </div>
          
          <div>
            <p className="text-lctextsecondary text-sm mb-2">Are you an attorney?</p>
            <Link href="/attorney/login" className="text-lcaccent-client font-medium hover:underline">Attorney login</Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
