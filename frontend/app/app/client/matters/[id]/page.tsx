"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPost } from '@/lib/api';
import { ArrowLeft, X, CheckCircle2, AlertCircle, Calendar, User } from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lctextsecondary">Loading matter details...</p>
      </div>
    );
  }

  if (error && !matter) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Link href="/app/client/dashboard" className="flex items-center gap-2 text-lcaccent-client hover:opacity-80 mb-6">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
        <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!matter) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Link href="/app/client/dashboard" className="flex items-center gap-2 text-lcaccent-client hover:opacity-80 mb-6">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
        <p className="text-lctextsecondary">Matter not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back Link */}
      <Link href="/app/client/dashboard" className="flex items-center gap-2 text-lcaccent-client hover:opacity-80 mb-6 transition">
        <ArrowLeft size={20} />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{matter.title}</h1>
            <div className="flex items-center gap-3">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(matter.status)}`}>
                {matter.status}
              </span>
              <span className="text-sm text-lctextsecondary">
                Created {new Date(matter.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          {matter.status !== 'closed' && matter.status !== 'cancelled' && (
            <button
              onClick={() => setShowCloseConfirm(true)}
              className="px-4 py-2 text-sm font-medium text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition"
            >
              Close Matter
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white border border-lcborder rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Description</h2>
            <p className="text-lctextsecondary leading-relaxed">{matter.description}</p>
          </div>

          {/* Details */}
          <div className="bg-white border border-lcborder rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Case Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-lctextsecondary">Matter Type</label>
                <p className="text-lctextprimary capitalize">{matter.matter_type?.replace(/_/g, ' ')}</p>
              </div>
              {matter.practice_area && (
                <div>
                  <label className="text-sm font-medium text-lctextsecondary">Practice Area</label>
                  <p className="text-lctextprimary">{matter.practice_area.name}</p>
                </div>
              )}
              {matter.jurisdiction && (
                <div>
                  <label className="text-sm font-medium text-lctextsecondary">Jurisdiction</label>
                  <p className="text-lctextprimary">{matter.jurisdiction}</p>
                </div>
              )}
            </div>
          </div>

          {/* Attorney Info */}
          {matter.attorney && (
            <div className="bg-white border border-lcborder rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Assigned Attorney</h2>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-lcaccent-attorney rounded-full flex items-center justify-center text-white font-semibold">
                  {matter.attorney.user.first_name?.[0]}{matter.attorney.user.last_name?.[0]}
                </div>
                <div>
                  <p className="font-medium text-lctextprimary">
                    {matter.attorney.user.first_name} {matter.attorney.user.last_name}
                  </p>
                  <a href={`mailto:${matter.attorney.user.email}`} className="text-sm text-lcaccent-attorney hover:opacity-80">
                    {matter.attorney.user.email}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-white border border-lcborder rounded-lg p-6">
            <h3 className="font-semibold mb-4">Status</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-lctextsecondary uppercase tracking-wide mb-1">Current Status</p>
                <p className="font-medium capitalize text-lctextprimary">{matter.status}</p>
              </div>
              {matter.next_action_date && (
                <div>
                  <p className="text-xs text-lctextsecondary uppercase tracking-wide mb-1 flex items-center gap-2">
                    <Calendar size={14} />
                    Next Action
                  </p>
                  <p className="font-medium text-lctextprimary">
                    {new Date(matter.next_action_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-lcborder rounded-lg p-6">
            <h3 className="font-semibold mb-4">Timeline</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-lctextsecondary">Created</p>
                <p className="text-lctextprimary font-medium">
                  {new Date(matter.created_at).toLocaleDateString()} at {new Date(matter.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div>
                <p className="text-lctextsecondary">Last Updated</p>
                <p className="text-lctextprimary font-medium">
                  {new Date(matter.updated_at).toLocaleDateString()} at {new Date(matter.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Close Matter Modal */}
      {showCloseConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={24} className="text-red-600" />
              <h3 className="text-lg font-semibold">Close Matter?</h3>
            </div>
            <p className="text-lctextsecondary mb-6">
              Are you sure you want to close this matter? This action cannot be undone. You will still have access to view the matter and its history.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="flex-1 px-4 py-2 border border-lcborder rounded-lg text-lctextprimary hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseMatter}
                disabled={closing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
              >
                {closing ? 'Closing...' : 'Close Matter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
