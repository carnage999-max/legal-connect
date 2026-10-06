import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ title: 'Delete your account', description: 'Request deletion of your Legal Connect account and the data tied to it.', path: '/delete-account' });

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
