/* Simple fetch-based API client for Legal Connect frontend
   Uses NEXT_PUBLIC_API_BASE_URL and stores JWT in localStorage under 'lc_token'.
*/

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('lc_token');
}

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string,string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string,string> || {}),
  };

  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }

  if (!res.ok) {
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

export async function obtainToken(username: string, password: string) {
  const data = await request('/api/v1/auth/token/', { method: 'POST', body: JSON.stringify({ username, password }) });
  if (data && data.access) {
    if (typeof window !== 'undefined') localStorage.setItem('lc_token', data.access);
  }
  return data;
}

export function logout() {
  if (typeof window !== 'undefined') localStorage.removeItem('lc_token');
}

export default { apiGet, apiPost, obtainToken, logout };
