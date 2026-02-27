"use client";
import React, { useEffect, useState } from 'react';
import { Smartphone, Monitor, Clock, MapPin, Trash2, LogOut, RefreshCw } from 'lucide-react';
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

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone size={20} className="text-blue-600" />;
    }
    return <Monitor size={20} className="text-gray-600" />;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin">
          <RefreshCw size={24} className="text-lcaccentclient" />
        </div>
        <span className="ml-3 text-lctextsecondary">Loading your devices...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-lctextprimary">Active Devices</h2>
          <p className="text-sm text-lctextsecondary mt-1">
            Manage your active sessions across different devices
          </p>
        </div>
        {devices.length > 1 && (
          <button
            onClick={handleLogoutAllOthers}
            disabled={loggingOutAll}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
          >
            <LogOut size={16} />
            Logout All Others
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {devices.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Smartphone size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-lctextsecondary">No active devices found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {devices.map((device) => (
            <div
              key={device.id}
              className="border border-lcborder rounded-lg p-4 hover:border-lcaccentclient hover:shadow-sm transition-all bg-white"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">{getDeviceIcon(device.user_agent)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lctextprimary">
                        {device.device_name || getDeviceName(device.user_agent)}
                      </h3>
                      {device.is_current && (
                        <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded">
                          Current Device
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-lctextsecondary space-y-1 mt-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={14} />
                        {device.ip_address}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={14} />
                        Last active: {formatDate(device.last_active_at)}
                      </div>
                      <p className="text-gray-500 truncate">{device.user_agent}</p>
                    </div>
                  </div>
                </div>

                {!device.is_current && (
                  <button
                    onClick={() => handleRevokeDevice(device.id)}
                    disabled={revoking === device.id}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Revoke this device"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium">Security Tip</p>
        <p className="mt-1">
          Regularly review your active devices and revoke any that you no longer recognize or use.
        </p>
      </div>
    </div>
  );
}
