"use client";
import React, { ReactNode } from 'react';
import { CalendarDays, Inbox, LayoutDashboard, MessageSquare, Receipt, Smartphone, UserCircle, Users } from 'lucide-react';
import { PortalShell, type PortalNavItem } from '@/components/PortalShell';

const navItems: PortalNavItem[] = [
  { label: 'Dashboard', href: '/app/attorney/dashboard', icon: LayoutDashboard },
  { label: 'New Requests', href: '/app/attorney/requests', icon: Inbox },
  { label: 'Active Clients', href: '/app/attorney/clients', icon: Users },
  { label: 'Calendar', href: '/app/attorney/calendar', icon: CalendarDays },
  { label: 'Messages', href: '/app/attorney/messages', icon: MessageSquare },
  { label: 'Billing', href: '/app/attorney/billing', icon: Receipt },
  { label: 'Account', href: '/app/attorney/account', icon: UserCircle },
  { label: 'Devices', href: '/app/attorney/devices', icon: Smartphone },
];

export function AttorneyLayout({ children }: { children: ReactNode }): React.ReactNode {
  return (
    <PortalShell variant="attorney" nav={navItems} portalLabel="Attorney portal">
      {children}
    </PortalShell>
  );
}
