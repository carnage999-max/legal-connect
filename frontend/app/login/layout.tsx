import type { Metadata } from 'next';
import React, { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ title: 'Client sign in', description: 'Sign in to Legal Connect to see your matters, messages and payments.', path: '/login' });

export default function LoginLayout({ children }: { children: ReactNode }): React.ReactNode {
  return <AuthProvider>{children}</AuthProvider>;
}
