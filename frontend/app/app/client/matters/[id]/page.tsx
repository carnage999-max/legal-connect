"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPost } from '@/lib/api';
import { AlertCircle, ArrowLeft, CalendarDays } from 'lucide-react';
import { ClientLayout } from '@/components/ClientLayout';
import { DashboardLoadingSkeleton } from '@/components/DashboardLoadingSkeleton';
import { StatusBadge } from '@/components/ui/Page';
import { Spinner } from '@/components/ui/Spinner';

interface Matter {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending' | 'matching' | 'open' | 'closed' | 'cancelled';
  matter_type: string;
  jurisdiction: string;
  practice_area?: {
    id: string;
    name: string;
  };
  attorney?: {
    id: string;
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
  created_at: string;
  updated_at: string;
  next_action_date?: string;
  notes?: string;
}

export default function MatterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [closing, setClosing] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [matterId, setMatterId] = useState<string | null>(null);

  useEffect(() => {
    // Unwrap the params promise
    (async () => {
      const resolvedParams = await params;
      setMatterId(resolvedParams.id);
    })();
  }, [params]);

  useEffect(() => {
    if (!user || !matterId) return;
    loadMatter();
  }, [user, matterId]);

  const loadMatter = async () => {
    if (!matterId) return;
    try {
      setLoading(true);
      setError('');
      const data = await apiGet(`/api/v1/matters/${matterId}/`);
      setMatter(data);
    } catch (err: any) {
      setError(err?.data?.detail || 'Failed to load matter details');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseMatter = async () => {
    if (!matterId) return;
    try {
      setClosing(true);
      setError('');
      const data = await apiPost(`/api/v1/matters/${matterId}/status/`, {
        status: 'closed',
        notes: 'Matter closed by client'
      });
      setMatter(data);
      setShowCloseConfirm(false);
    } catch (err: any) {
      setError(err?.data?.detail || 'Failed to close matter');
    } finally {
      setClosing(false);
    }
  };

  const back = (
    <Link href="/app/client/matters" className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-blue-600 hover:underline">
      <ArrowLeft size={18} /> All matters
    </Link>
  );

  if (loading) {
    return (
      <ClientLayout>
        <DashboardLoadingSkeleton />
      </ClientLayout>
    );
  }

  if (!matter) {
    return (
      <ClientLayout>
        {back}
        {error ? (
          <div role="alert" className="notice notice-error">
            <AlertCircle size={18} className="mt-0.5 flex-none" />
            {error}
          </div>
        ) : (
          <p className="text-mute">Matter not found.</p>
        )}
      </ClientLayout>
    );
  }

  const stamp = (d: string) =>
    `${new Date(d).toLocaleDateString('en-US')} at ${new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <ClientLayout>
      {back}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h1 className="title-2">{matter.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StatusBadge status={matter.status} />
            <span className="text-sm text-mute">Created {new Date(matter.created_at).toLocaleDateString('en-US')}</span>
          </div>
        </div>
        {matter.status !== 'closed' && matter.status !== 'cancelled' && (
          <button onClick={() => setShowCloseConfirm(true)} className="btn btn-outline btn-sm flex-none !border-[#fecdca] !text-[#b42318] hover:!bg-[#fef3f2]">
            Close matter
          </button>
        )}
      </div>

      {error && (
        <div role="alert" className="notice notice-error mb-6">
          <AlertCircle size={18} className="mt-0.5 flex-none" />
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="title-3">Description</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-mute">{matter.description}</p>
          </section>

          <section className="card p-6">
            <h2 className="title-3">Case details</h2>
            <dl className="mt-4 grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-mute">Matter type</dt>
                <dd className="mt-1 font-medium capitalize text-ink">{matter.matter_type?.replace(/_/g, ' ')}</dd>
              </div>
              {matter.practice_area && (
                <div>
                  <dt className="text-sm font-medium text-mute">Practice area</dt>
                  <dd className="mt-1 font-medium text-ink">{matter.practice_area.name}</dd>
                </div>
              )}
              {matter.jurisdiction && (
                <div>
                  <dt className="text-sm font-medium text-mute">Jurisdiction</dt>
                  <dd className="mt-1 font-medium text-ink">{matter.jurisdiction}</dd>
                </div>
              )}
            </dl>
          </section>

          {matter.attorney && (
            <section className="card p-6">
              <h2 className="title-3">Your attorney</h2>
              <div className="mt-4 flex items-center gap-4">
                <span className="grid h-14 w-14 flex-none place-items-center rounded-full bg-ink font-semibold text-white">
                  {matter.attorney.user.first_name?.[0]}
                  {matter.attorney.user.last_name?.[0]}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-ink">
                    {matter.attorney.user.first_name} {matter.attorney.user.last_name}
                  </p>
                  <a href={`mailto:${matter.attorney.user.email}`} className="block truncate text-sm font-medium text-blue-600 hover:underline">
                    {matter.attorney.user.email}
                  </a>
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="card p-6">
            <h2 className="title-3">Status</h2>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-sm text-mute">Current status</dt>
                <dd className="mt-1.5"><StatusBadge status={matter.status} /></dd>
              </div>
              {matter.next_action_date && (
                <div>
                  <dt className="flex items-center gap-1.5 text-sm text-mute"><CalendarDays size={14} /> Next action</dt>
                  <dd className="mt-1 font-medium text-ink">{new Date(matter.next_action_date).toLocaleDateString('en-US')}</dd>
                </div>
              )}
            </dl>
            {matter.attorney && matter.status !== 'closed' && matter.status !== 'cancelled' && (
              <Link href={`/app/client/payments?matter_id=${matter.id}`} className="btn btn-outline btn-sm mt-5 w-full">
                Pay consultation fee
              </Link>
            )}
          </section>

          <section className="card p-6">
            <h2 className="title-3">Timeline</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-mute">Created</dt>
                <dd className="mt-0.5 font-medium text-ink">{stamp(matter.created_at)}</dd>
              </div>
              <div>
                <dt className="text-mute">Last updated</dt>
                <dd className="mt-0.5 font-medium text-ink">{stamp(matter.updated_at)}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>

      {showCloseConfirm && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-labelledby="close-title">
          <div className="rise-in w-full max-w-md rounded-[20px] bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#fef3f2] text-[#b42318]">
                <AlertCircle size={22} />
              </span>
              <h2 id="close-title" className="title-3">Close this matter?</h2>
            </div>
            <p className="mt-4 leading-relaxed text-mute">
              This cannot be undone. You will still be able to view the matter and its history.
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowCloseConfirm(false)} className="btn btn-outline flex-1">
                Cancel
              </button>
              <button onClick={handleCloseMatter} disabled={closing} className="btn btn-danger flex-1">
                {closing && <Spinner />}
                {closing ? 'Closing…' : 'Close matter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  );
}
