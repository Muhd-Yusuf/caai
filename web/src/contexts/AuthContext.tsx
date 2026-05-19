import React, { createContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  is_active?: boolean;
  is_whitelisted?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (name: string, email: string) => Promise<{ isReturning: boolean }>;
  signIn: (email: string) => Promise<{ isReturning: boolean }>;
  logout: () => void;
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  register: async () => ({ isReturning: false }),
  signIn: async () => ({ isReturning: false }),
  logout: () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const data = await api.get<{ user: User }>('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const register = async (name: string, email: string) => {
    const data = await api.post<{ user: User; isReturning?: boolean }>('/auth/register', { name, email });
    setUser(data.user);
    return { isReturning: !!data.isReturning };
  };

  const signIn = async (email: string) => {
    const data = await api.post<{ user: User; isReturning?: boolean }>('/auth/register', { email, mode: 'login' });
    setUser(data.user);
    return { isReturning: !!data.isReturning };
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch {
      // Clear state even if the request fails
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        register,
        signIn,
        logout,
        refresh: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
