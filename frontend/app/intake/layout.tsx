import type { Metadata } from 'next';
import React, { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ title: 'Start Legal Intake', description: 'Describe your legal issue once. We screen for conflicts, match you with available attorneys in your jurisdiction and open a secure conversation.', path: '/intake' });

export default function IntakeLayout({ children }: { children: ReactNode }): React.ReactNode {
  return <AuthProvider>{children}</AuthProvider>;
}
