"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { apiPost } from '@/lib/api';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    userType: 'client' // 'client' or 'attorney'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await apiPost('/api/v1/auth/registration/', {
        email: formData.email,
        password1: formData.password,
        password2: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
        user_type: formData.userType
      });

      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err: any) {
      setError(err?.data?.detail || err?.data?.message || 'Signup failed. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-lctextprimary">
      <header className="site-container pt-6 border-b border-lcborder">
        <nav className="flex items-center justify-between py-4">
          <a href="/" className="inline-flex items-center gap-2 font-semibold hover:opacity-80 transition">
            <img src="/logo.png" alt="Legal Connect" className="h-6 w-6" />
            <span>Legal Connect</span>
          </a>
          <a href="/" className="text-sm font-medium text-lctextsecondary hover:text-lctextprimary transition">← Back</a>
        </nav>
      </header>

      <main className="site-container py-12">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-lctextsecondary">Sign up to get started with Legal Connect</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-300 rounded-lg text-green-700 text-sm">
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Account Type</label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="w-full border border-lcborder rounded-lg p-3 text-lctextprimary focus:outline-none focus:ring-2 focus:border-lcaccentclient"
                style={{ outlineColor: '#065F46' }}
              >
                <option value="client">Client (Need Legal Help)</option>
                <option value="attorney">Attorney (Provide Legal Services)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="w-full border border-lcborder rounded-lg p-3 text-lctextprimary focus:outline-none focus:ring-2 focus:border-lcaccentclient"
                style={{ outlineColor: '#065F46' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full border border-lcborder rounded-lg p-3 text-lctextprimary focus:outline-none focus:ring-2 focus:border-lcaccentclient"
                style={{ outlineColor: '#065F46' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full border border-lcborder rounded-lg p-3 text-lctextprimary focus:outline-none focus:ring-2 focus:border-lcaccentclient"
                style={{ outlineColor: '#065F46' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full border border-lcborder rounded-lg p-3 text-lctextprimary focus:outline-none focus:ring-2 focus:border-lcaccentclient"
                style={{ outlineColor: '#065F46' }}
              />
              <p className="text-xs text-lctextsecondary mt-1">At least 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full border border-lcborder rounded-lg p-3 text-lctextprimary focus:outline-none focus:ring-2 focus:border-lcaccentclient"
                style={{ outlineColor: '#065F46' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#065F46',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                width: '100%',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.opacity = '1')}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-sm text-lctextsecondary mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-lcaccentclient hover:underline font-medium">
              Log in
            </Link>
          </p>

          <p className="text-center text-xs text-lctextsecondary mt-4">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
