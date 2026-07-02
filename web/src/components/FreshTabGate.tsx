import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';

const SESSION_KEY = 'caai_session_started';

// Sets the session flag whenever the user is on any route other than /detect.
// Mount this once inside <Router> so route changes update the flag.
export function SessionFlagger() {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname !== '/detect') {
      sessionStorage.setItem(SESSION_KEY, '1');
    }
    // Analyses on the ACT page persist only across the Detect <-> How-to hop.
    // Landing anywhere else clears them, matching the "leaving the tool clears
    // your analysis" behaviour while making How-to an exception.
    if (location.pathname !== '/detect' && location.pathname !== '/how-to-use-act') {
      sessionStorage.removeItem('caai_act_state');
    }
  }, [location.pathname]);
  return null;
}

// On the very first visit to /detect within a tab session (i.e. opening a new
// tab at /detect, restoring a tab, following a bookmark, or a hard refresh on
// /detect) bounce the user to the home page. Once they've been on any other
// route within the SPA, the SessionFlagger sets the flag and subsequent visits
// to /detect pass through. The flag lives in sessionStorage so it clears the
// moment the tab is closed. Admins bypass this gate entirely — they always
// navigate intentionally, so the "first-tab" warm-up doesn't apply.
export default function FreshTabGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { isAdmin, isLoading: isAdminLoading } = useAdminAuth();
  const [allowed] = useState(() => !!sessionStorage.getItem(SESSION_KEY));

  useEffect(() => {
    if (isAdminLoading) return;
    if (!allowed && !isAdmin) {
      navigate('/', { replace: true });
    }
  }, [allowed, isAdmin, isAdminLoading, navigate]);

  if (isAdminLoading) return null;
  if (!allowed && !isAdmin) return null;
  return <>{children}</>;
}
