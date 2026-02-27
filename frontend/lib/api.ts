/* Simple fetch-based API client for Legal Connect frontend
   Calls backend API at configured base URL.
   Handles token expiry and auto-logout on 401 responses.
*/

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.legalconnectapp.com';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('lc_token');
}

function getTokenExpiry(): number | null {
  if (typeof window === 'undefined') return null;
  const expiry = localStorage.getItem('lc_token_expiry');
  return expiry ? parseInt(expiry, 10) : null;
}

function isTokenExpired(): boolean {
  const expiry = getTokenExpiry();
  if (!expiry) return false;
  return Date.now() > expiry;
}

function handleTokenExpiry() {
  if (typeof window === 'undefined') return;
  // Clear token
  localStorage.removeItem('lc_token');
  localStorage.removeItem('lc_token_expiry');
  // Redirect to login
  window.location.href = '/login?expired=true';
}

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string,string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string,string> || {}),
  };

  const token = getToken();
  if (token) {
    if (isTokenExpired()) {
      handleTokenExpiry();
      throw new Error('Token expired');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log(`${options.method || 'GET'} ${API_BASE}${path}`, { 
    hasAuth: !!token,
    tokenExpiry: isTokenExpired() ? 'expired' : 'valid'
  });

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }

  if (!res.ok) {
    console.error(`API Error ${res.status}:`, path, data);
    // Handle 401 Unauthorized - token expired or invalid
    if (res.status === 401) {
      handleTokenExpiry();
    }
    const err: any = new Error('API error');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export async function apiGet(path: string) {
  return request(path, { method: 'GET' });
}

export async function apiPost(path: string, body?: any) {
  return request(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
}

export async function apiDelete(path: string) {
  return request(path, { method: 'DELETE' });
}

export async function obtainToken(username: string, password: string) {
  const data = await request('/api/v1/auth/token/', { method: 'POST', body: JSON.stringify({ email: username, password }) });
  if (data && data.access) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lc_token', data.access);
      console.log('Token stored:', data.access.substring(0, 20) + '...');
      
      // Decode JWT to get expiry time (exp claim)
      try {
        const payload = JSON.parse(atob(data.access.split('.')[1]));
        if (payload.exp) {
          // exp is in seconds, convert to milliseconds
          localStorage.setItem('lc_token_expiry', String(payload.exp * 1000));
          console.log('Token expiry:', new Date(payload.exp * 1000));
        }
      } catch (e) {
        // If decoding fails, set expiry to 24 hours from now
        localStorage.setItem('lc_token_expiry', String(Date.now() + 24 * 60 * 60 * 1000));
        console.log('Token expiry (fallback): 24 hours');
      }
    }
  } else {
    console.error('Token response missing "access" field:', data);
  }
  return data;
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('lc_token');
    localStorage.removeItem('lc_token_expiry');
  }
}

// Device Session Management APIs
export async function getActiveSessions() {
  return apiGet('/api/v1/users/sessions/');
}

export async function revokeDevice(sessionId: string) {
  return apiDelete(`/api/v1/users/sessions/${sessionId}/`);
}

export async function logoutAllOtherDevices() {
  return apiPost('/api/v1/users/sessions/logout-all/');
}

export default { apiGet, apiPost, apiDelete, obtainToken, logout, getActiveSessions, revokeDevice, logoutAllOtherDevices };
