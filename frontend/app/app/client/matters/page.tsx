"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/api';
import { AlertCircle, Briefcase, ChevronRight, Plus } from 'lucide-react';
import { ClientLayout } from '@/components/ClientLayout';
import { DashboardLoadingSkeleton } from '@/components/DashboardLoadingSkeleton';
import { EmptyState, PageHeader, StatusBadge } from '@/components/ui/Page';

interface Matter {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending' | 'matching' | 'open' | 'closed' | 'cancelled';
  matter_type: string;
  created_at: string;
  attorney?: {
    id: string;
    user: {
      first_name: string;
      last_name: string;
    };
  };
}

export default function MattersPage() {
  const { user } = useAuth();
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    loadMatters();
  }, [user]);

  const loadMatters = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiGet('/api/v1/matters/');
      setMatters(data.results || data);
    } catch (err: any) {
      setError(err?.data?.detail || 'Failed to load matters');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientLayout>
      <PageHeader
        title="My matters"
        description="Every legal matter you have started, and where each one stands."
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

      {loading ? (
        <DashboardLoadingSkeleton />
      ) : matters.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No matters yet"
          text="Start with a short intake. We screen for conflicts and match you with an available attorney."
          action={{ label: 'Start a new legal intake', href: '/intake' }}
        />
      ) : (
        <ul className="space-y-3">
          {matters.map((matter) => (
            <li key={matter.id}>
              <Link href={`/app/client/matters/${matter.id}`} className="card card-hover group block p-5 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-[1.1rem] font-semibold text-ink transition-colors group-hover:text-blue-600">{matter.title}</h2>
                    <p className="mt-1.5 line-clamp-2 text-[0.95rem] leading-relaxed text-mute">{matter.description}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                      <StatusBadge status={matter.status} />
                      <span className="text-sm text-mute">{new Date(matter.created_at).toLocaleDateString()}</span>
                      {matter.attorney && (
                        <span className="text-sm font-medium text-ink">
                          {matter.attorney.user.first_name} {matter.attorney.user.last_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={20} className="mt-1 flex-none text-mute transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </ClientLayout>
  );
}
