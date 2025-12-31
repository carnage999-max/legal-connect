"use client";
import { useEffect, useState } from 'react';
import { ClientLayout } from '@/components/ClientLayout';
import { FileText, Calendar, Mail } from 'lucide-react';
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
        <div className="mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Welcome back</h1>
          <p className="text-base md:text-lg text-lctextsecondary">Manage your legal matters and appointments in one place.</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
          <div className="bg-white border border-lcborder rounded-lg p-4 md:p-6 shadow-sm">
            <p className="text-lctextsecondary text-xs md:text-sm font-medium mb-2 truncate">Active Matters</p>
            <p className="text-3xl md:text-4xl font-bold text-lcaccentclient">{loading ? '-' : matters.length}</p>
          </div>
          <div className="bg-white border border-lcborder rounded-lg p-4 md:p-6 shadow-sm">
            <p className="text-lctextsecondary text-xs md:text-sm font-medium mb-2 truncate">Upcoming Appointments</p>
            <p className="text-3xl md:text-4xl font-bold text-lcaccentclient">{loading ? '-' : appointments.length}</p>
          </div>
          <div className="bg-white border border-lcborder rounded-lg p-4 md:p-6 shadow-sm">
            <p className="text-lctextsecondary text-xs md:text-sm font-medium mb-2 truncate">Unread Messages</p>
            <p className="text-3xl md:text-4xl font-bold text-lcaccentclient">{loading ? '-' : unreadCount}</p>
          </div>
        </div>

        {/* Active Matters Section */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3 md:gap-0">
            <h2 className="text-xl md:text-2xl font-bold">Active Matters</h2>
            <a href="/intake" className="px-4 py-2 bg-lcaccentclient text-white rounded-lg font-medium hover:opacity-90 transition text-sm w-full md:w-auto text-center md:text-left">
              + New Matter
            </a>
          </div>
          {matters.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-lcborder rounded-lg p-8 md:p-12 text-center">
              <div className="flex justify-center mb-4"><FileText size={48} strokeWidth={1.5} className="text-lctextsecondary" /></div>
              <p className="text-lg text-lctextprimary font-medium mb-2">No active matters yet</p>
              <p className="text-lctextsecondary mb-6 text-sm md:text-base">Start by describing your legal issue. We'll match you with the right attorney.</p>
              <a href="/intake" className="inline-block px-6 py-2 bg-lcaccentclient text-white rounded-lg font-medium hover:opacity-90 transition text-sm">
                Start New Matter
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {matters.map(m => (
                <div key={m.id} className="bg-white border border-lcborder rounded-lg p-4 md:p-6 hover:shadow-md transition">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base md:text-lg truncate">{m.title}</h3>
                      <p className="text-lctextsecondary text-sm">Status: {m.status}</p>
                    </div>
                    <a href={`/app/client/matters/${m.id}`} className="px-4 py-2 border border-lcborder rounded-lg hover:bg-gray-50 transition text-sm whitespace-nowrap">
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Appointments Section */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-bold mb-6">Upcoming Appointments</h2>
          {appointments.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-lcborder rounded-lg p-8 md:p-12 text-center">
              <div className="flex justify-center mb-4"><Calendar size={48} strokeWidth={1.5} className="text-lctextsecondary" /></div>
              <p className="text-lg text-lctextprimary font-medium mb-2">No upcoming appointments</p>
              <p className="text-lctextsecondary text-sm md:text-base">Once matched with an attorney, you can schedule appointments here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map(a => (
                <div key={a.id} className="bg-white border border-lcborder rounded-lg p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{a.attorney}</p>
                      <p className="text-lctextsecondary text-sm">{new Date(a.date).toLocaleDateString()}</p>
                    </div>
                    <a href={`/appointments/${a.id}`} className="px-4 py-2 border border-lcborder rounded-lg hover:bg-gray-50 transition text-sm whitespace-nowrap">
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Activity Section */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-6">Recent Activity</h2>
          <div className="bg-white border-2 border-dashed border-lcborder rounded-lg p-8 md:p-12 text-center">
            <div className="flex justify-center mb-4"><Mail size={48} strokeWidth={1.5} className="text-lctextsecondary" /></div>
            <p className="text-lg text-lctextprimary font-medium mb-2">No recent activity</p>
            <p className="text-lctextsecondary text-sm md:text-base">Messages, documents, and updates will appear here.</p>
          </div>
        </section>
        </div>
      )}
    </ClientLayout>
  );
}
