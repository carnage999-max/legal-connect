"use client";
import { useEffect, useState } from 'react';
import { ClientLayout } from '@/components/ClientLayout';
import Link from 'next/link';
import { AlertCircle, Briefcase, CalendarDays, ChevronRight, FileText, Mail, MessageSquare, Plus } from 'lucide-react';
import { EmptyState, PageHeader, SectionTitle, StatCard, StatusBadge } from '@/components/ui/Page';
import { apiGet } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { DashboardLoadingSkeleton } from '@/components/DashboardLoadingSkeleton';

type Matter = { id: number; title: string; status: string };
type Appointment = { id: number; date: string; attorney: string };

export default function ClientDashboardPage(): React.ReactNode {
  const { user } = useAuth();
  const [matters, setMatters] = useState<Matter[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
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
        setMatters(mattersRes?.results || []);
        setAppointments(appointmentsRes?.results || []);
        setUnreadCount(appointmentsRes?.unread_count || 0);
      } catch (e: any) {
        setError(e?.status === 401 ? 'Please log in again to access your dashboard.' : 'Failed to load dashboard');
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  return (
    <ClientLayout>
      {loading ? (
        <DashboardLoadingSkeleton />
      ) : (
        <div>
          <PageHeader
            title="Welcome back"
            description="Manage your legal matters and appointments in one place."
            actions={
              <Link href="/intake" className="btn btn-primary">
                <Plus size={18} /> New matter
              </Link>
            }
          />

          {error && (
            <div role="alert" className="notice notice-error mb-6">
              <AlertCircle size={18} className="mt-0.5 flex-none" />
              {error}
            </div>
          )}

          <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
            <StatCard label="Active matters" value={matters.length} icon={Briefcase} tone="green" />
            <StatCard label="Upcoming appointments" value={appointments.length} icon={CalendarDays} />
            <StatCard label="Unread messages" value={unreadCount} icon={MessageSquare} />
          </div>

          <section className="mb-12">
            <SectionTitle
              action={
                matters.length > 0 ? (
                  <Link href="/app/client/matters" className="btn btn-ghost btn-sm">
                    View all
                  </Link>
                ) : undefined
              }
            >
              Active matters
            </SectionTitle>
            {matters.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No active matters yet"
                text="Describe your legal issue once. We screen for conflicts and match you with an attorney."
                action={{ label: 'Start a new matter', href: '/intake' }}
              />
            ) : (
              <ul className="space-y-3">
                {matters.map((m) => (
                  <li key={m.id}>
                    <Link href={`/app/client/matters/${m.id}`} className="card card-hover group flex items-center justify-between gap-4 p-5">
                      <div className="min-w-0">
                        <h3 className="truncate text-[1.05rem] font-semibold text-ink">{m.title}</h3>
                        <div className="mt-2">
                          <StatusBadge status={m.status} />
                        </div>
                      </div>
                      <ChevronRight size={20} className="flex-none text-mute transition-transform group-hover:translate-x-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mb-12">
            <SectionTitle>Upcoming appointments</SectionTitle>
            {appointments.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No upcoming appointments"
                text="Once you are matched with an attorney, you can schedule appointments here."
              />
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
                          <p className="truncate font-semibold text-ink">{a.attorney}</p>
                          <p className="text-sm text-mute">{new Date(a.date).toLocaleDateString('en-US')}</p>
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
            <SectionTitle>Recent activity</SectionTitle>
            <EmptyState icon={Mail} title="No recent activity" text="Messages, documents and updates will appear here." />
          </section>
        </div>
      )}
    </ClientLayout>
  );
}
