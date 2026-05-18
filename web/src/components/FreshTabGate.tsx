import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SESSION_KEY = 'caai_session_started';

// Sets the session flag whenever the user is on any route other than /detect.
// Mount this once inside <Router> so route changes update the flag.
export function SessionFlagger() {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname !== '/detect') {
      sessionStorage.setItem(SESSION_KEY, '1');
    }
  }, [location.pathname]);
  return null;
}

// On the very first visit to /detect within a tab session (i.e. opening a new
// tab at /detect, restoring a tab, following a bookmark, or a hard refresh on
// /detect) bounce the user to the home page. Once they've been on any other
// route within the SPA, the SessionFlagger sets the flag and subsequent visits
// to /detect pass through. The flag lives in sessionStorage so it clears the
// moment the tab is closed.
export default function FreshTabGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [allowed] = useState(() => !!sessionStorage.getItem(SESSION_KEY));

  useEffect(() => {
    if (!allowed) {
      navigate('/', { replace: true });
    }
  }, [allowed, navigate]);

  if (!allowed) return null;
  return <>{children}</>;
}
