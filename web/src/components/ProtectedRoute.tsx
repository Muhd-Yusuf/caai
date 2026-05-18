import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Wraps protected pages. Revalidates auth on every mount so that a user who
// has been deleted or suspended in the admin panel is booted on the next
// navigation, not just on a full page reload.
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, refresh } = useAuth();
  const [revalidated, setRevalidated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    refresh().finally(() => {
      if (!cancelled) setRevalidated(true);
    });
    return () => { cancelled = true; };
  }, [refresh]);

  if (isLoading || !revalidated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a1a2e] to-[#16213e]">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/register" replace />;
  }

  return <>{children}</>;
}
