"use client";
import React, { useEffect, useState } from 'react';
import { AlertCircle, Clock, LogOut, MapPin, Monitor, ShieldCheck, Smartphone, Trash2 } from 'lucide-react';
import { EmptyState, PageHeader } from '@/components/ui/Page';
import { Spinner } from '@/components/ui/Spinner';
import { getActiveSessions, revokeDevice, logoutAllOtherDevices } from '@/lib/api';

interface DeviceSession {
  id: string;
  device_name: string;
  device_fingerprint: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  last_active_at: string;
  is_active: boolean;
  is_current?: boolean;
}

export function DeviceManager() {
  const [devices, setDevices] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revoking, setRevoking] = useState<string | null>(null);
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getActiveSessions();
      
      // Handle DRF paginated response
      if (data?.results && Array.isArray(data.results)) {
        setDevices(data.results);
      } else if (Array.isArray(data)) {
        setDevices(data);
      } else {
        console.error('Unexpected response format:', data);
        setError('Invalid response format from server');
        setDevices([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch sessions:', {
        error: err,
        status: err.status,
        data: err.data,
        message: err.message
      });
      
      if (err.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (err.status === 403) {
        setError('You do not have permission to view this page.');
      } else if (err.status === 404) {
        setError('Device sessions endpoint not found.');
      } else {
        setError(`Failed to load your devices: ${err.data?.detail || err.message || 'Unknown error'}`);
      }
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeDevice = async (sessionId: string) => {
    if (!confirm('Are you sure you want to revoke this device? You will be logged out on that device.')) {
      return;
    }
    try {
      setRevoking(sessionId);
      await revokeDevice(sessionId);
      setDevices(devices.filter(d => d.id !== sessionId));
    } catch (err: any) {
      console.error('Failed to revoke device:', err);
      setError('Failed to revoke device. Please try again.');
    } finally {
      setRevoking(null);
    }
  };

  const handleLogoutAllOthers = async () => {
    if (!confirm('Are you sure? You will be logged out on all other devices.')) {
      return;
    }
    try {
      setLoggingOutAll(true);
      await logoutAllOtherDevices();
      await fetchSessions();
    } catch (err: any) {
      console.error('Failed to logout all devices:', err);
      setError('Failed to logout other devices. Please try again.');
    } finally {
      setLoggingOutAll(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDeviceName = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari')) return 'Safari';
    if (ua.includes('edge')) return 'Edge';
    if (ua.includes('mobile') || ua.includes('android')) return 'Mobile Browser';
    if (ua.includes('iphone')) return 'iPhone Safari';
    return 'Unknown Browser';
  };

  const isMobile = (userAgent: string) => /mobile|android|iphone/i.test(userAgent);

  if (loading) {
    return (
      <div role="status" className="flex items-center gap-3 py-12 text-mute">
        <Spinner size={22} /> Loading your devices…
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Active devices"
        description="Manage your signed-in sessions across devices."
        actions={
          devices.length > 1 ? (
            <button onClick={handleLogoutAllOthers} disabled={loggingOutAll} className="btn btn-outline btn-sm !border-[#fecdca] !text-[#b42318] hover:!bg-[#fef3f2]">
              {loggingOutAll ? <Spinner size={16} /> : <LogOut size={16} />}
              Sign out all others
            </button>
          ) : undefined
        }
      />

      {error && (
        <div role="alert" className="notice notice-error mb-6">
          <AlertCircle size={18} className="mt-0.5 flex-none" />
          {error}
        </div>
      )}

      {devices.length === 0 ? (
        <EmptyState icon={Smartphone} title="No active devices found" />
      ) : (
        <ul className="space-y-3">
          {devices.map((device) => (
            <li key={device.id} className="card flex items-start justify-between gap-4 p-5">
              <div className="flex min-w-0 items-start gap-4">
                <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-blue-50 text-blue-600">
                  {isMobile(device.user_agent) ? <Smartphone size={22} /> : <Monitor size={22} />}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-ink">{device.device_name || getDeviceName(device.user_agent)}</h2>
                    {device.is_current && <span className="badge badge-green">This device</span>}
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-mute">
                    <p className="flex items-center gap-2">
                      <MapPin size={14} className="flex-none" /> {device.ip_address}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock size={14} className="flex-none" /> Last active {formatDate(device.last_active_at)}
                    </p>
                    <p className="truncate text-xs">{device.user_agent}</p>
                  </div>
                </div>
              </div>

              {!device.is_current && (
                <button
                  onClick={() => handleRevokeDevice(device.id)}
                  disabled={revoking === device.id}
                  className="grid h-11 w-11 flex-none place-items-center rounded-xl text-[#b42318] transition-colors hover:bg-[#fef3f2] disabled:opacity-50"
                  aria-label={`Sign out ${device.device_name || getDeviceName(device.user_agent)}`}
                >
                  {revoking === device.id ? <Spinner size={18} /> : <Trash2 size={18} />}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="notice notice-info mt-8">
        <ShieldCheck size={18} className="mt-0.5 flex-none" />
        <div>
          <p className="font-semibold">Security tip</p>
          <p className="mt-0.5">Review your devices regularly and sign out any you no longer recognize.</p>
        </div>
      </div>
    </div>
  );
}
