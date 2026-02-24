import React, { createContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

interface AdminContextType {
  isAdmin: boolean;
  isLoading: boolean;
  adminEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const AdminAuthContext = createContext<AdminContextType>({
  isAdmin: false,
  isLoading: true,
  adminEmail: null,
  login: async () => {},
  logout: async () => {},
  changePassword: async () => {},
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  const checkAdmin = useCallback(async () => {
    try {
      // Try to access an admin endpoint to verify session
      await api.get<{ config: unknown }>('/admin/config');
      setIsAdmin(true);
    } catch {
      setIsAdmin(false);
      setAdminEmail(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ admin: { email: string } }>('/auth/admin-login', {
      email,
      password,
    });
    setIsAdmin(true);
    setAdminEmail(data.admin.email);
  };

  const logout = async () => {
    await api.post('/auth/admin-logout');
    setIsAdmin(false);
    setAdminEmail(null);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await api.put('/auth/admin-password', { currentPassword, newPassword });
  };

  return (
    <AdminAuthContext.Provider
      value={{ isAdmin, isLoading, adminEmail, login, logout, changePassword }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}
