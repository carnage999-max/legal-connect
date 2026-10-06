import type { Metadata } from 'next';
import React, { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ title: 'Attorney sign in', description: 'Attorney sign in for Legal Connect: referrals, clients, appointments and billing.', path: '/attorney/login' });

export default function AttorneyRootLayout({ children }: { children: ReactNode }): React.ReactNode {
  return <AuthProvider>{children}</AuthProvider>;
}
