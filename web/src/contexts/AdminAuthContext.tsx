import React, { createContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

interface AdminContextType {
  isAdmin: boolean;
  isLoading: boolean;
  adminEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  changeEmail: (newEmail: string) => Promise<string>;
}

export const AdminAuthContext = createContext<AdminContextType>({
  isAdmin: false,
  isLoading: true,
  adminEmail: null,
  login: async () => {},
  logout: async () => {},
  changePassword: async () => {},
  changeEmail: async () => '',
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  const checkAdmin = useCallback(async () => {
    try {
      // Try to access an admin endpoint to verify session. This also returns the
      // signed-in admin's email, so adminEmail survives a page reload (needed for
      // the hidden username field on the Change Password form).
      const data = await api.get<{ config: unknown; email?: string | null }>('/admin/config');
      setIsAdmin(true);
      if (data?.email) setAdminEmail(data.email);
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
    // Always clear local state, even if the server call fails (e.g. the token
    // was already invalidated by a password change) — otherwise the UI stays
    // "logged in" with a dead session and the user is locked out.
    try {
      await api.post('/auth/admin-logout');
    } catch {
      // ignore — we clear state regardless below
    } finally {
      setIsAdmin(false);
      setAdminEmail(null);
      // Drop the carried-through password so it never lingers past a logout.
      sessionStorage.removeItem('caai_admin_current_pw');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await api.put('/auth/admin-password', { currentPassword, newPassword });
  };

  const changeEmail = async (newEmail: string) => {
    const data = await api.put<{ email: string }>('/auth/admin-email', { newEmail });
    setAdminEmail(data.email);
    return data.email;
  };

  return (
    <AdminAuthContext.Provider
      value={{ isAdmin, isLoading, adminEmail, login, logout, changePassword, changeEmail }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}
