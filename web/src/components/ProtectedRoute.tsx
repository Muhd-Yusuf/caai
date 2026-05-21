import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAdminAuth } from '../hooks/useAdminAuth';

// Wraps protected pages. Revalidates auth on every mount so that a user who
// has been deleted or suspended in the admin panel is booted on the next
// navigation, not just on a full page reload. Admins are also let through —
// admin login overrides the regular user gate, so an admin can access the ACT
// without being asked to register/sign in as a normal user as well.
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, refresh } = useAuth();
  const { isAdmin, isLoading: isAdminLoading } = useAdminAuth();
  const [revalidated, setRevalidated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    refresh().finally(() => {
      if (!cancelled) setRevalidated(true);
    });
    return () => { cancelled = true; };
  }, [refresh]);

  if (isLoading || isAdminLoading || !revalidated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a1a2e] to-[#16213e]">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated && !isAdmin) {
    return <Navigate to="/register" replace />;
  }

  return <>{children}</>;
}
