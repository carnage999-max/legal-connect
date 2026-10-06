import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ title: 'Verify your email', path: '/verify-email', index: false });

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
