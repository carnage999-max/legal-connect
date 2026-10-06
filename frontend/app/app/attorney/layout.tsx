import type { Metadata } from 'next';
import React, { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ title: 'Attorney portal', path: '/app/attorney/dashboard', index: false });

export default function AttorneyAppLayout({ children }: { children: ReactNode }): React.ReactNode {
  return <AuthProvider>{children}</AuthProvider>;
}
