'use client';
import { useEffect, useState } from 'react';
import { AttorneyLayout } from '@/components/AttorneyLayout';
import { Calendar, Clock, MapPin, X, Loader, Plus } from 'lucide-react';
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

  if (loading) {
    return (
      <AttorneyLayout>
        <div className="flex items-center justify-center p-12">
          <Loader size={32} className="animate-spin" />
        </div>
      </AttorneyLayout>
    );
  }

  return (
    <AttorneyLayout>
      <div>
        <h1 className="text-4xl font-bold mb-2">Calendar</h1>
        <p className="text-lg text-lctextattorney-secondary mb-8">Manage your appointments and availability</p>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">{success}</div>}

        <div className="grid grid-cols-2 gap-8">
          {/* Appointments */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Your Appointments</h2>
            {appointments.length === 0 ? (
              <div className="bg-lcbgattorney rounded-lg p-8 text-center text-lctextattorney-secondary border border-lcborder-attorney">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p className="mb-4">No appointments scheduled</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments
                  .filter(a => a.status !== 'cancelled')
                  .map(apt => (
                    <div key={apt.id} className="bg-lcbgattorney rounded-lg p-4 border border-lcborder-attorney hover:shadow-md transition">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-lctextattorney-primary">{apt.client_name}</h3>
                        <button
                          onClick={() => handleCancelAppointment(apt.id)}
                          className="p-1 hover:bg-red-100 rounded transition text-lctextattorney-secondary hover:text-red-600"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="space-y-2 text-sm text-lctextattorney-secondary">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          {new Date(apt.scheduled_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          {apt.scheduled_time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          Matter #{apt.matter_id}
                        </div>
                      </div>
                      <div className="mt-3 inline-block text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                        {apt.status}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Available Slots */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Available Slots</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availability.length === 0 ? (
                <div className="bg-lcbgattorney rounded-lg p-8 text-center text-lctextattorney-secondary border border-lcborder-attorney">
                  <Plus size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="mb-4">No available slots configured</p>
                </div>
              ) : (
                availability.map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSlot(selectedSlot?.date === slot.date && selectedSlot?.time === slot.time ? null : slot)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
                      selectedSlot?.date === slot.date && selectedSlot?.time === slot.time
                        ? 'border-lcaccentattorney bg-lcaccentattorney/10'
                        : 'border-lcborder-attorney bg-lcbgattorney hover:border-lcaccentattorney'
                    }`}
                  >
                    <div className="font-semibold text-lctextattorney-primary">
                      {new Date(slot.date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-lctextattorney-secondary">{slot.time}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AttorneyLayout>
  );
}
