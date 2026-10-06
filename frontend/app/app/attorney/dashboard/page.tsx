"use client";
import { useEffect, useState } from 'react';
import { AttorneyLayout } from '@/components/AttorneyLayout';
import Link from 'next/link';
import { AlertCircle, CalendarDays, ChevronRight, Inbox, Scale, Users, Wallet } from 'lucide-react';
import { EmptyState, PageHeader, SectionTitle, StatCard, StatusBadge } from '@/components/ui/Page';
import { apiGet } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { DashboardLoadingSkeleton } from '@/components/DashboardLoadingSkeleton';

type Matter = { id: number; title: string; client: string; status: string };

export default function AttorneyDashboardPage(): React.ReactNode {
  const { user } = useAuth();
  const [matters, setMatters] = useState<Matter[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState({ referrals: 0, active: 0, earnings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return; // Don't load until user is available

    async function loadDashboard() {
      try {
        setLoading(true);
        setError('');
        const [mattersRes, appointmentsRes] = await Promise.all([
          apiGet('/api/v1/matters/'),
          apiGet('/api/v1/scheduling/appointments/')
        ]);
        
        const mattersList = mattersRes?.results || [];
        setMatters(mattersList);
        setAppointments(appointmentsRes?.results || []);
        
        const active = mattersList.filter((m: any) => m.status === 'active').length;
        setStats({ referrals: mattersList.length, active, earnings: 0 });
      } catch (e: any) {
        setError(e?.status === 401 ? 'Please log in again to access your dashboard.' : 'Failed to load dashboard');
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  const activeMatters = matters.filter((m) => m.status === 'active');

  return (
    <AttorneyLayout>
      {loading ? (
        <DashboardLoadingSkeleton />
      ) : (
        <div>
          <PageHeader title="Your dashboard" description="Manage referrals, cases and appointments." />

          {error && (
            <div role="alert" className="notice notice-error mb-6">
              <AlertCircle size={18} className="mt-0.5 flex-none" />
              {error}
            </div>
          )}

          <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <StatCard label="New referrals" value={stats.referrals} icon={Inbox} />
            <StatCard label="Active cases" value={stats.active} icon={Users} tone="green" />
            <StatCard label="Earnings this month" value={`$${stats.earnings}`} icon={Wallet} />
          </div>

          <section className="mb-12">
            <SectionTitle>New referral requests</SectionTitle>
            {matters.length === 0 ? (
              <EmptyState icon={Inbox} title="No new referrals" text="New client referrals that match your practice area will appear here." />
            ) : (
              <ul className="space-y-3">
                {matters.map((m) => (
                  <li key={m.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-ink">{m.title}</h3>
                      <p className="mt-1 text-sm text-mute">Client: {m.client}</p>
                    </div>
                    <a href={`/matters/${m.id}`} className="btn btn-blue btn-sm flex-none">
                      Review
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mb-12">
            <SectionTitle>Today&apos;s schedule</SectionTitle>
            {appointments.length === 0 ? (
              <EmptyState icon={CalendarDays} title="No appointments today" text="Your scheduled appointments will appear here." />
            ) : (
              <ul className="space-y-3">
                {appointments.map((a) => (
                  <li key={a.id}>
                    <a href={`/appointments/${a.id}`} className="card card-hover group flex items-center justify-between gap-4 p-5">
                      <div className="flex min-w-0 items-center gap-4">
                        <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-blue-50 text-blue-600">
                          <CalendarDays size={22} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{a.client_name || 'Client'}</p>
                          <p className="text-sm text-mute">{new Date(a.date).toLocaleString('en-US')}</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="flex-none text-mute transition-transform group-hover:translate-x-1" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <SectionTitle>Active cases</SectionTitle>
            {activeMatters.length === 0 ? (
              <EmptyState icon={Scale} title="No active cases yet" text="Once you accept referrals, they will be listed here with client information and case status." />
            ) : (
              <ul className="space-y-3">
                {activeMatters.map((m) => (
                  <li key={m.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-ink">{m.title}</h3>
                      <div className="mt-2">
                        <StatusBadge status={m.status} />
                      </div>
                    </div>
                    <a href={`/matters/${m.id}`} className="btn btn-outline btn-sm flex-none">
                      View details
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </AttorneyLayout>
  );
}
