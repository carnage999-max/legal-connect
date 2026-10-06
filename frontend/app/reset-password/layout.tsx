import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ title: 'Choose a new password', path: '/reset-password', index: false });

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
