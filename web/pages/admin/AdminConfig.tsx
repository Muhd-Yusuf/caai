import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Check } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { api } from '../../services/api';

interface RateLimitConfig {
  max_submissions: number;
  window_hours: number;
}

const AdminConfig: React.FC = () => {
  const { changePassword } = useAdminAuth();

  // Rate limit config
  const [maxSubmissions, setMaxSubmissions] = useState(10);
  const [windowHours, setWindowHours] = useState(8);
  const [configLoading, setConfigLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);
  const [configMessage, setConfigMessage] = useState('');
  const [configError, setConfigError] = useState('');

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
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
      setPasswordMessage('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage(''), 3000);
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

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={8}
                />
              </div>

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
