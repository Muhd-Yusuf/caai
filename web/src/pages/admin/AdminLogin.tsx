import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading, login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const pendingCredsRef = useRef<{ email?: string; password?: string } | null>(null);
  const userEditedRef = useRef(false);
  const [prefilled, setPrefilled] = useState(false);

  // After a password change, AdminConfig stashes the NEW credentials here and
  // sends the admin over. Read them once on mount (before the form renders) so we
  // don't depend on the browser's saved credential or its "update password?"
  // popup — which was the source of the old password lingering.
  useEffect(() => {
    const raw = sessionStorage.getItem('caai_login_prefill');
    if (!raw) return;
    sessionStorage.removeItem('caai_login_prefill');
    try {
      const creds = JSON.parse(raw);
      if (creds?.password) {
        pendingCredsRef.current = creds;
        setPrefilled(true);
      }
    } catch {
      // ignore malformed prefill
    }
  }, []);

  // Apply the prefill only once the form is actually on screen (isLoading flips
  // false after the session re-check). That is ALSO when the browser fires its
  // autofill — which would drop in the OLD saved password — so we re-assert our
  // value (React state + the DOM node directly) a few times over ~1s to make sure
  // ours wins. We stop early if the admin starts editing, so we never clobber
  // their typing.
  useEffect(() => {
    if (isLoading) return;
    const creds = pendingCredsRef.current;
    if (!creds) return;
    const apply = () => {
      if (userEditedRef.current) return;
      if (creds.email) {
        setEmail(creds.email);
        if (emailRef.current) emailRef.current.value = creds.email;
      }
      setPassword(creds.password!);
      if (passwordRef.current) passwordRef.current.value = creds.password!;
    };
    apply();
    let ticks = 0;
    const id = window.setInterval(() => {
      apply();
      if (++ticks >= 8 || userEditedRef.current) {
        window.clearInterval(id);
        pendingCredsRef.current = null;
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a1a2e] to-[#16213e]">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #3a3838 0%, #252525 100%)',
      }}
    >
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-500 mt-2">CAAI Administration Panel</p>
          </div>

          {prefilled && (
            <div className="mb-5 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
              Your password was changed. We've filled in your new password below —
              just click <span className="font-semibold">Sign In</span> to continue.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                ref={emailRef}
                type="email"
                id="admin-email"
                name="username"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={() => { userEditedRef.current = true; }}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  id="admin-password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={() => { userEditedRef.current = true; }}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center text-red-600 text-sm">
                <AlertCircle size={16} className="mr-1 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-700 text-white py-3 rounded-md font-medium hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2"
              style={{ borderColor: '#ed7c30' }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default AdminLogin;
