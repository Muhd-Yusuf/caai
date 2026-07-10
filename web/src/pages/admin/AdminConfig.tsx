import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Check, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { api } from '../../services/api';

interface RateLimitConfig {
  max_submissions: number;
  window_hours: number;
}

// Password input with a show/hide toggle so the admin can see exactly what is in
// the field (e.g. a value the browser auto-filled) and correct it if needed.
const PasswordField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  name: string;
  minLength?: number;
}> = ({ label, value, onChange, autoComplete, name, minLength }) => {
  const [show, setShow] = useState(false);
  // Keep the field read-only until the admin actually focuses it. Browsers do
  // not autofill read-only inputs, so this stops the browser's saved (and, after
  // a change, STALE) admin password from being dropped into the field on load.
  // Clicking Change Password is then the single source of truth — the browser's
  // password manager is out of the loop entirely.
  const [active, setActive] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          readOnly={!active}
          onFocus={() => setActive(true)}
          minLength={minLength}
          required
          className="w-full px-4 py-2 pr-11 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          aria-label={show ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
};

const AdminConfig: React.FC = () => {
  const { changePassword, login, logout, adminEmail } = useAdminAuth();
  const navigate = useNavigate();

  // Rate limit config
  const [maxSubmissions, setMaxSubmissions] = useState(10);
  const [windowHours, setWindowHours] = useState(8);
  const [configLoading, setConfigLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);
  const [configMessage, setConfigMessage] = useState('');
  const [configError, setConfigError] = useState('');

  // Password change. "Current Password" is pre-filled with whatever the admin
  // typed on the login screen (stashed in sessionStorage there) so the field is
  // never blank — carried through, not read from the browser's password store.
  const [currentPassword, setCurrentPassword] = useState(
    () => sessionStorage.getItem('caai_admin_current_pw') || ''
  );
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await api.get<{ config: RateLimitConfig }>('/admin/config');
      setMaxSubmissions(data.config.max_submissions);
      setWindowHours(data.config.window_hours);
    } catch (err: any) {
      setConfigError(err.message || 'Failed to load config');
    } finally {
      setConfigLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSaving(true);
    setConfigError('');
    setConfigMessage('');

    try {
      await api.put('/admin/config', {
        max_submissions: maxSubmissions,
        window_hours: windowHours,
      });
      setConfigMessage('Settings saved successfully');
      setTimeout(() => setConfigMessage(''), 3000);
    } catch (err: any) {
      setConfigError(err.message || 'Failed to save settings');
    } finally {
      setConfigSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setPasswordSaving(true);

    try {
      await changePassword(currentPassword, newPassword);
      // The new password becomes the "current" one — keep the carried-through
      // value in sync so a second change in the same session pre-fills correctly.
      sessionStorage.setItem('caai_admin_current_pw', newPassword);
      // Changing the password revokes the current Supabase session, so the
      // existing token is now dead. Sign out cleanly and send the admin back to
      // the login page to re-authenticate with the new password (this avoids the
      // locked-out state and ensures the next "current password" is the new one).
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('Password changed. Signing you back in…');
      // Changing the password revokes the current Supabase session, so we must
      // re-establish one. Rather than bounce to the login screen — where the
      // browser autofills its STALE saved password and its "update password?"
      // popup gets in the way — we sign the admin straight back in with the new
      // password we already have in hand. No login form, no browser popup, no
      // autofill collision. This is the reliable path.
      try {
        await login(adminEmail ?? '', newPassword);
        navigate('/admin');
      } catch {
        // Auto sign-in failed for some reason — fall back to the login screen,
        // prefilled with the new password so it still doesn't depend on the
        // browser's saved credential (see AdminLogin).
        sessionStorage.setItem(
          'caai_login_prefill',
          JSON.stringify({ email: adminEmail ?? '', password: newPassword })
        );
        await logout();
        window.location.assign('/admin/login');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <main
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #3a3838 0%, #252525 100%)' }}
    >
      <div className="container mx-auto px-4 md:px-6 pt-24 sm:pt-32 pb-16">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/admin"
            className="inline-flex items-center text-white hover:text-blue-200 transition-colors mb-8"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </Link>

          <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

          {/* Rate Limit Configuration */}
          <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Rate Limiting</h2>
            <p className="text-gray-600 text-sm mb-6">
              Configure how many submissions users can make within a time window.
              Whitelisted users bypass these limits.
            </p>

            {configLoading ? (
              <p className="text-gray-500">Loading settings...</p>
            ) : (
              <form onSubmit={handleSaveConfig} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Submissions
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={maxSubmissions}
                      onChange={(e) => setMaxSubmissions(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Window (hours)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={windowHours}
                      onChange={(e) => setWindowHours(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {configError && (
                  <div className="flex items-center text-red-600 text-sm">
                    <AlertCircle size={16} className="mr-1" />
                    {configError}
                  </div>
                )}

                {configMessage && (
                  <div className="flex items-center text-green-600 text-sm">
                    <Check size={16} className="mr-1" />
                    {configMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={configSaving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {configSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </form>
            )}
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Change Password</h2>

            {/* No hidden username field here on purpose: we deliberately keep the
                browser's password manager OUT of this form so it can't autofill a
                stale saved password. The password change is applied server-side the
                moment this form is submitted — nothing here depends on the browser
                "save/update password?" popup. */}
            <form onSubmit={handleChangePassword} className="space-y-4" autoComplete="off">
              <PasswordField
                label="Current Password"
                name="current-password"
                value={currentPassword}
                onChange={setCurrentPassword}
                autoComplete="current-password"
              />
              <PasswordField
                label="New Password"
                name="new-password"
                value={newPassword}
                onChange={setNewPassword}
                autoComplete="new-password"
                minLength={8}
              />
              <PasswordField
                label="Confirm New Password"
                name="confirm-new-password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
                minLength={8}
              />

              {passwordError && (
                <div className="flex items-center text-red-600 text-sm">
                  <AlertCircle size={16} className="mr-1" />
                  {passwordError}
                </div>
              )}

              {passwordMessage && (
                <div className="flex items-center text-green-600 text-sm">
                  <Check size={16} className="mr-1" />
                  {passwordMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={passwordSaving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {passwordSaving ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminConfig;
