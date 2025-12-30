"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/api';
import { ChevronRight, AlertCircle } from 'lucide-react';

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'matching':
        return 'bg-blue-100 text-blue-800';
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">My Matters</h1>
        <p className="text-lctextsecondary">Loading matters...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Matters</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {matters.length === 0 ? (
        <div className="bg-white border border-lcborder rounded-lg p-12 text-center">
          <AlertCircle size={48} className="mx-auto text-lctextsecondary mb-4 opacity-30" />
          <p className="text-lctextsecondary mb-4">No matters yet</p>
          <Link href="/intake" className="text-lcaccent-client hover:opacity-80 font-medium">
            Start a new legal intake →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {matters.map(matter => (
            <Link
              key={matter.id}
              href={`/app/client/matters/${matter.id}`}
              className="block bg-white border border-lcborder rounded-lg p-4 hover:shadow-md transition group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-lctextprimary group-hover:text-lcaccent-client transition truncate">
                    {matter.title}
                  </h3>
                  <p className="text-sm text-lctextsecondary mt-1 line-clamp-2">
                    {matter.description}
                  </p>
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(matter.status)}`}>
                      {matter.status}
                    </span>
                    <span className="text-xs text-lctextsecondary">
                      {new Date(matter.created_at).toLocaleDateString()}
                    </span>
                    {matter.attorney && (
                      <span className="text-xs text-lctextsecondary bg-gray-50 px-2 py-1 rounded">
                        {matter.attorney.user.first_name} {matter.attorney.user.last_name}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight size={20} className="text-lctextsecondary flex-shrink-0 mt-1 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
