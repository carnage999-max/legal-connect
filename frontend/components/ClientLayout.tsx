"use client";
import React, { ReactNode } from 'react';
import { Briefcase, CreditCard, FilePlus2, FileText, LayoutDashboard, MessageSquare, Smartphone, UserCircle } from 'lucide-react';
import { PortalShell, type PortalNavItem } from '@/components/PortalShell';

const navTabs: PortalNavItem[] = [
  { label: 'Dashboard', href: '/app/client/dashboard', icon: LayoutDashboard },
  { label: 'My Matters', href: '/app/client/matters', icon: Briefcase },
  { label: 'New Matter', href: '/intake', icon: FilePlus2 },
  { label: 'Messages', href: '/app/client/messages', icon: MessageSquare },
  { label: 'Documents', href: '/app/client/documents', icon: FileText },
  { label: 'Payments', href: '/app/client/payments', icon: CreditCard },
  { label: 'Account', href: '/app/client/account', icon: UserCircle },
  { label: 'Devices', href: '/app/client/devices', icon: Smartphone },
];

export function ClientLayout({ children }: { children: ReactNode }): React.ReactNode {
  return (
    <PortalShell variant="client" nav={navTabs} portalLabel="Client portal">
      {children}
    </PortalShell>
  );
}
