"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { obtainToken, logout as apiLogout, apiGet } from '../lib/api';
import { useRouter } from 'next/navigation';

type User = { username: string; user_type?: string } | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  clearAuth: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Function to fetch user details
  const fetchUserDetails = async () => {
    try {
      const userDetails = await apiGet('/api/v1/auth/user/');
      if (userDetails) {
        setUser({ username: userDetails.email, user_type: userDetails.user_type });
      }
    } catch (err) {
      console.error('Failed to fetch user details:', err);
      setUser({ username: 'me' });
    }
  };

  useEffect(() => {
    // Check local token presence on mount
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('lc_token');
      const expiry = localStorage.getItem('lc_token_expiry');
      
      // Check if token is expired
      if (token && expiry) {
        const expiryTime = parseInt(expiry, 10);
        if (Date.now() > expiryTime) {
          // Token is expired
          clearAuth();
          return;
        }
      }
      
      if (token) {
        fetchUserDetails();
      }
    }
  }, []);

  async function login(username: string, password: string) {
    setLoading(true);
    try {
      await obtainToken(username, password);
      await fetchUserDetails();
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    apiLogout();
    setUser(null);
  }

  function clearAuth() {
    apiLogout();
    setUser(null);
    router.push('/login?expired=true');
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, clearAuth }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
