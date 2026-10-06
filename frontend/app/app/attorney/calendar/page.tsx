'use client';
import { useEffect, useState } from 'react';
import { AttorneyLayout } from '@/components/AttorneyLayout';
import { AlertCircle, CalendarDays, CheckCircle2, Clock, MapPin, Plus, X } from 'lucide-react';
import { DashboardLoadingSkeleton } from '@/components/DashboardLoadingSkeleton';
import { EmptyState, PageHeader, StatusBadge } from '@/components/ui/Page';
import { apiGet, apiPost } from '@/lib/api';

interface Appointment {
  id: number;
  matter_id: number;
  scheduled_date: string;
  scheduled_time: string;
  client_name: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface AvailableSlot {
  date: string;
  time: string;
}

export default function AttorneyCalendarPage(): React.ReactNode {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availability, setAvailability] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [appointmentsRes, availabilityRes] = await Promise.all([
          apiGet('/api/v1/scheduling/appointments/'),
          apiGet('/api/v1/scheduling/availability/'),
        ]);

        setAppointments(appointmentsRes?.results || []);
        setAvailability(availabilityRes?.results || []);
      } catch (e) {
        setError('Failed to load calendar');
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function handleCancelAppointment(id: number) {
    if (!confirm('Cancel this appointment?')) return;

    try {
      await apiPost(`/api/v1/scheduling/appointments/${id}/cancel/`, {});
      setAppointments(appointments.filter(a => a.id !== id));
      setSuccess('Appointment cancelled');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError('Failed to cancel appointment');
      console.error(e);
    }
  }

  const live = appointments.filter((a) => a.status !== 'cancelled');

  return (
    <AttorneyLayout>
      <PageHeader title="Calendar" description="Manage your appointments and availability." />

      {error && (
        <div role="alert" className="notice notice-error mb-6">
          <AlertCircle size={18} className="mt-0.5 flex-none" />
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="notice notice-success mb-6">
          <CheckCircle2 size={18} className="mt-0.5 flex-none" />
          {success}
        </div>
      )}

      {loading ? (
        <DashboardLoadingSkeleton />
      ) : (
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-8">
          <section>
            <h2 className="title-3 mb-5 text-[1.35rem]">Your appointments</h2>
            {live.length === 0 ? (
              <EmptyState icon={CalendarDays} title="No appointments scheduled" />
            ) : (
              <ul className="space-y-3">
                {live.map((apt) => (
                  <li key={apt.id} className="card p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-ink">{apt.client_name}</h3>
                      <button
                        onClick={() => handleCancelAppointment(apt.id)}
                        className="-mr-2 -mt-2 grid h-11 w-11 place-items-center rounded-xl text-mute transition-colors hover:bg-[#fef3f2] hover:text-[#b42318]"
                        aria-label={`Cancel appointment with ${apt.client_name}`}
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="mt-2 space-y-2 text-sm text-mute">
                      <p className="flex items-center gap-2"><CalendarDays size={16} /> {new Date(apt.scheduled_date).toLocaleDateString('en-US')}</p>
                      <p className="flex items-center gap-2"><Clock size={16} /> {apt.scheduled_time}</p>
                      <p className="flex items-center gap-2"><MapPin size={16} /> Matter #{apt.matter_id}</p>
                    </div>
                    <div className="mt-4">
                      <StatusBadge status={apt.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="title-3 mb-5 text-[1.35rem]">Available slots</h2>
            {availability.length === 0 ? (
              <EmptyState icon={Plus} title="No available slots configured" />
            ) : (
              <ul className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
                {availability.map((slot, idx) => {
                  const on = selectedSlot?.date === slot.date && selectedSlot?.time === slot.time;
                  return (
                    <li key={idx}>
                      <button
                        onClick={() => setSelectedSlot(on ? null : slot)}
                        aria-pressed={on}
                        className={`w-full rounded-2xl border p-4 text-left transition-all ${
                          on ? 'border-blue-500 bg-[color:var(--card-bg,#f5f5f7)] shadow-[0_0_0_3px_rgb(30_127_214/0.18)]' : 'border-transparent bg-[color:var(--card-bg,#f5f5f7)] hover:bg-[color:var(--card-bg-hover,#ececf0)]'
                        }`}
                      >
                        <span className="block font-semibold text-ink">{new Date(slot.date).toLocaleDateString('en-US')}</span>
                        <span className="block text-sm text-mute">{slot.time}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}
    </AttorneyLayout>
  );
}
