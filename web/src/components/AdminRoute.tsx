import React, { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';

// Auto sign-out after this much inactivity, so a session left idle doesn't end
// up stuck on a dead token — it returns cleanly to the Admin Login instead.
const IDLE_LIMIT_MS = 15 * 60 * 1000; // 15 minutes

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading, logout } = useAdminAuth();
  const logoutRef = useRef(logout);
  logoutRef.current = logout;

  useEffect(() => {
    if (!isAdmin) return;
    let timer: number;
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => { logoutRef.current(); }, IDLE_LIMIT_MS);
    };
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [isAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a1a2e] to-[#16213e]">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
