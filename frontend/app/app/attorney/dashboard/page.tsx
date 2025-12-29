"use client";
import { useEffect, useState } from 'react';
import { AttorneyLayout } from '@/components/AttorneyLayout';
import { Inbox, Calendar, Scale } from 'lucide-react';
import { apiGet } from '@/lib/api';

type Matter = { id: number; title: string; client: string; status: string };

export default function AttorneyDashboardPage(): React.ReactNode {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState({ referrals: 0, active: 0, earnings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
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
        setError('Failed to load dashboard');
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  return (
    <AttorneyLayout>
      <div>
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Your Dashboard</h1>
          <p className="text-lg text-lctextattorneysecondary">Manage referrals, cases, and appointments.</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-lcbgattorneysecondary rounded-lg p-6 border border-lcborderattorney shadow-sm">
            <p className="text-lctextattorneysecondary text-sm font-medium mb-3">New Referrals</p>
            <p className="text-5xl font-bold text-lcaccentattorney">{loading ? '-' : stats.referrals}</p>
            <p className="text-lctextattorneysecondary text-xs mt-2">Total available</p>
          </div>
          <div className="bg-lcbgattorneysecondary rounded-lg p-6 border border-lcborderattorney shadow-sm">
            <p className="text-lctextattorneysecondary text-sm font-medium mb-3">Active Cases</p>
            <p className="text-5xl font-bold text-lcaccentattorney">{loading ? '-' : stats.active}</p>
            <p className="text-lctextattorneysecondary text-xs mt-2">Currently active</p>
          </div>
          <div className="bg-lcbgattorneysecondary rounded-lg p-6 border border-lcborderattorney shadow-sm">
            <p className="text-lctextattorneysecondary text-sm font-medium mb-3">Earnings</p>
            <p className="text-5xl font-bold text-lcaccentattorney">${loading ? '-' : stats.earnings}</p>
            <p className="text-lctextattorneysecondary text-xs mt-2">This month</p>
          </div>
        </div>

        {/* New Referral Requests */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">New Referral Requests</h2>
          {matters.length === 0 ? (
            <div className="bg-lcbgattorneysecondary border-2 border-dashed border-lcborderattorney rounded-lg p-12 text-center">
              <div className="flex justify-center mb-4"><Inbox size={48} strokeWidth={1.5} className="text-lctextattorneysecondary" /></div>
              <p className="text-lg text-lctextattorney font-medium mb-2">No new referrals</p>
              <p className="text-lctextattorneysecondary">New client referrals that match your practice area will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {matters.map(m => (
                <div key={m.id} className="bg-lcbgattorneysecondary border border-lcborderattorney rounded-lg p-6 hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-lctextattorney">{m.title}</h3>
                      <p className="text-lctextattorneysecondary text-sm">Client: {m.client}</p>
                    </div>
                    <a href={`/matters/${m.id}`} className="px-4 py-2 bg-lcaccentattorney text-white rounded-lg font-medium hover:opacity-90 transition">
                      Review
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Today's Appointments */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Today's Schedule</h2>
          {appointments.length === 0 ? (
            <div className="bg-lcbgattorneysecondary border-2 border-dashed border-lcborderattorney rounded-lg p-12 text-center">
              <div className="flex justify-center mb-4"><Calendar size={48} strokeWidth={1.5} className="text-lctextattorneysecondary" /></div>
              <p className="text-lg text-lctextattorney font-medium mb-2">No appointments today</p>
              <p className="text-lctextattorneysecondary">Your scheduled appointments will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map(a => (
                <div key={a.id} className="bg-lcbgattorneysecondary border border-lcborderattorney rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lctextattorney">{a.client_name || 'Client'}</p>
                      <p className="text-lctextattorneysecondary text-sm">{new Date(a.date).toLocaleString()}</p>
                    </div>
                    <a href={`/appointments/${a.id}`} className="px-4 py-2 border border-lcborderattorney rounded-lg text-lctextattorney hover:bg-lcbgattorney transition">
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Active Cases */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Active Cases</h2>
          {matters.filter(m => m.status === 'active').length === 0 ? (
            <div className="bg-lcbgattorneysecondary border-2 border-dashed border-lcborderattorney rounded-lg p-12 text-center">
              <div className="flex justify-center mb-4"><Scale size={48} strokeWidth={1.5} className="text-lctextattorneysecondary" /></div>
              <p className="text-lg text-lctextattorney font-medium mb-2">No active cases yet</p>
              <p className="text-lctextattorneysecondary">Once you accept referrals, they'll be listed here with client information and case status.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {matters.filter(m => m.status === 'active').map(m => (
                <div key={m.id} className="bg-lcbgattorneysecondary border border-lcborderattorney rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-lctextattorney">{m.title}</h3>
                      <p className="text-lctextattorneysecondary text-sm">Status: {m.status}</p>
                    </div>
                    <a href={`/matters/${m.id}`} className="px-4 py-2 border border-lcborderattorney rounded-lg text-lctextattorney hover:bg-lcbgattorney transition">
                      View Details
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AttorneyLayout>
  );
}
