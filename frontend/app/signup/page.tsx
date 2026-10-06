"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Scale, User } from 'lucide-react';
import { apiPost } from '@/lib/api';
import { AuthShell } from '@/components/AuthShell';
import { PasswordField } from '@/components/ui/PasswordField';
import { Spinner } from '@/components/ui/Spinner';

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
    <AuthShell
      wide
      title="Create your account"
      subtitle="Start your intake, track your matters and message your attorney in one place."
      asideTitle="One account. One intake. The right attorney."
      asidePoints={['Describe your matter once', 'Conflicts are screened before anyone is contacted', 'Your information stays in your control']}
      asideImage={{
        src: '/problem-to-solution.jpeg',
        alt: 'On the left, a stressed man at a laptop surrounded by rejected requests. On the right, the same man shaking hands with an attorney. Legal Connect and its four steps sit between them.',
      }}
      footer={
        <>
          <p>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
          <p className="text-sm">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="font-medium text-ink underline underline-offset-2">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="font-medium text-ink underline underline-offset-2">
              Privacy Policy
            </Link>
            .
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
        {success && (
          <div role="status" className="notice notice-success">
            <CheckCircle2 size={18} className="mt-0.5 flex-none" />
            {success}
          </div>
        )}

        <fieldset>
          <legend className="label">I am signing up as</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="choice">
              <input type="radio" name="userType" value="client" checked={formData.userType === 'client'} onChange={handleChange} />
              <User size={18} className="flex-none text-blue-600" />
              <span>
                A client
                <span className="block text-xs font-normal text-mute">I need legal help</span>
              </span>
            </label>
            <label className="choice">
              <input type="radio" name="userType" value="attorney" checked={formData.userType === 'attorney'} onChange={handleChange} />
              <Scale size={18} className="flex-none text-blue-600" />
              <span>
                An attorney
                <span className="block text-xs font-normal text-mute">I provide legal services</span>
              </span>
            </label>
          </div>
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="label">First name</label>
            <input id="firstName" type="text" name="firstName" autoComplete="given-name" value={formData.firstName} onChange={handleChange} placeholder="John" className="field" />
          </div>
          <div>
            <label htmlFor="lastName" className="label">Last name</label>
            <input id="lastName" type="text" name="lastName" autoComplete="family-name" value={formData.lastName} onChange={handleChange} placeholder="Doe" className="field" />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" className="field" />
        </div>

        <PasswordField label="Password" name="password" autoComplete="new-password" value={formData.password} onChange={handleChange} placeholder="At least 8 characters" hint="Use at least 8 characters." />
        <PasswordField label="Confirm password" name="confirmPassword" autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat your password" />

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
          {loading && <Spinner />}
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}
