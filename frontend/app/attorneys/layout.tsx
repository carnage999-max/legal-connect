import type { Metadata } from 'next';
import React, { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ title: 'Join the attorney network', description: 'Apply to join Legal Connect and receive conflict-screened referrals in your practice areas and jurisdictions, with no upfront costs.', path: '/attorneys/apply' });

export default function AttorneysLayout({ children }: { children: ReactNode }): React.ReactNode {
  return <AuthProvider>{children}</AuthProvider>;
}
