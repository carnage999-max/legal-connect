import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ title: 'Create your account', description: 'Create a Legal Connect account to start an intake, track your matters and message your attorney.', path: '/signup' });

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
