import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password1: string;
    password2: string;
    first_name: string;
    last_name: string;
    user_type: 'client' | 'attorney';
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Only for initial auth check
  const [isAuthenticating, setIsAuthenticating] = useState(false); // For login/register button loading

  // Handle auth state changes from API (e.g., when refresh token expires)
  const handleAuthStateChange = useCallback((isAuthenticated: boolean) => {
    if (!isAuthenticated) {
      console.log('[Auth] Session expired, logging out');
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // Subscribe to auth state changes from API service
    api.setAuthStateChangeCallback(handleAuthStateChange);
    checkAuthStatus();

    // Cleanup subscription on unmount
    return () => {
      api.setAuthStateChangeCallback(() => {});
    };
  }, [handleAuthStateChange]);

  const checkAuthStatus = async () => {
    try {
      const token = await api.getAccessToken();
      if (token) {
        const userData = await api.getProfile();
        setUser(userData);
      }
    } catch (error) {
      console.log('Not authenticated or session expired');
      await api.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsAuthenticating(true);
    try {
      await api.login(email, password);
      const userData = await api.getProfile();
      setUser(userData);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const register = async (data: {
    email: string;
    password1: string;
    password2: string;
    first_name: string;
    last_name: string;
    user_type: 'client' | 'attorney';
  }) => {
    setIsAuthenticating(true);
    try {
      await api.register(data);
      // After registration, user needs to verify email before logging in
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await api.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticating,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
