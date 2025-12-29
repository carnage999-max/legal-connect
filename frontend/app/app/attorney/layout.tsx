'use client';

import React, { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';

export default function AttorneyAppLayout({ children }: { children: ReactNode }): React.ReactNode {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
