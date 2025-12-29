"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { obtainToken, logout as apiLogout } from '../lib/api';

type User = { username: string } | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check local token presence to set a basic user state
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('lc_token');
      if (token) setUser({ username: 'me' });
    }
  }, []);

  async function login(username: string, password: string) {
    setLoading(true);
    try {
      await obtainToken(username, password);
      setUser({ username });
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    apiLogout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
