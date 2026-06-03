import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus, Settings, LogOut, ChevronLeft, ChevronRight, AlertCircle, X } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { api } from '../../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  is_whitelisted: boolean;
  created_at: string;
  created_by: string;
  registered_ip: string | null;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

// Strip the host portion of the address so two signups from the same household
// collapse to an identical value, making duplicate-IP rows easy to spot at a
// glance even when the full IPs differ. IPv4 keeps the first three octets, IPv6
// keeps the first four hextets (/64 prefix), which is the standard subscriber
// network boundary.
function ipNetwork(ip: string | null): string {
  if (!ip) return '—';
  if (ip.includes(':')) {
    const groups = ip.split(':').slice(0, 4).filter(Boolean);
    return groups.length ? `${groups.join(':')}::/64` : '—';
  }
  const parts = ip.split('.');
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.x`;
  return '—';
}

const AdminDashboard: React.FC = () => {
  const { logout } = useAdminAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Create user modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Delete confirmation
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const fetchUsers = useCallback(async (opts: { silent?: boolean } = {}) => {
    if (!opts.silent) setIsLoading(true);
    setError('');
    try {
      const data = await api.get<UsersResponse>(
        `/admin/users?page=${page}&search=${encodeURIComponent(search)}&filter=${filter}`
      );
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      if (!opts.silent) setIsLoading(false);
    }
  }, [page, search, filter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  // Optimistic-update helpers: flip the row in local state first so the UI
  // responds instantly, then send the request. On failure, roll back the row
  // and surface the error. No full refetch needed — no "Loading users…" blink.

  const handleToggleActive = async (user: User) => {
    const next = !user.is_active;
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: next } : u));
    try {
      await api.patch(`/admin/users/${user.id}`, { is_active: next });
    } catch (err: any) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !next } : u));
      setError(err.message || 'Failed to update user');
    }
  };

  const handleToggleWhitelist = async (user: User) => {
    const next = !user.is_whitelisted;
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_whitelisted: next } : u));
    try {
      if (user.is_whitelisted) {
        await api.delete(`/admin/whitelist/${user.id}`);
      } else {
        await api.post(`/admin/whitelist/${user.id}`);
      }
    } catch (err: any) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_whitelisted: !next } : u));
      setError(err.message || 'Failed to update whitelist');
    }
  };

  const handleDelete = async (userId: string) => {
    const removed = users.find(u => u.id === userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    setTotal(t => Math.max(0, t - 1));
    setDeleteUserId(null);
    try {
      await api.delete(`/admin/users/${userId}`);
    } catch (err: any) {
      if (removed) {
        setUsers(prev => [...prev, removed].sort((a, b) => a.name.localeCompare(b.name)));
        setTotal(t => t + 1);
      }
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setIsCreating(true);

    try {
      await api.post('/admin/users', { name: newName, email: newEmail });
      setShowCreateModal(false);
      setNewName('');
      setNewEmail('');
      // Silent refetch so the new user appears without blanking the table.
      fetchUsers({ silent: true });
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <main
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #3a3838 0%, #252525 100%)' }}
    >
      <div className="container mx-auto px-4 md:px-6 pt-24 sm:pt-32 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">User Management</h1>
              <p className="text-blue-100 mt-1">{total} total users</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus size={18} />
                Create User
              </button>
              <Link
                to="/admin/config"
                className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Settings size={18} />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-gray-800 rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </form>
              <div className="flex gap-2">
                {['all', 'active', 'suspended'].map((f) => (
                  <button
                    key={f}
                    onClick={() => { setFilter(f); setPage(1); }}
                    className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                      filter === f
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
              <button onClick={() => setError('')} className="ml-auto">
                <X size={18} />
              </button>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">IP</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Network</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Whitelisted</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Registered</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-500">
                        Loading users...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">{user.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                        <td className="py-3 px-4 text-xs text-gray-500 font-mono">
                          {user.registered_ip || '—'}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500 font-mono">
                          {ipNetwork(user.registered_ip)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.is_active ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {user.is_whitelisted && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Whitelisted
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleActive(user)}
                              className={`text-xs px-3 py-1 rounded ${
                                user.is_active
                                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              } transition-colors`}
                            >
                              {user.is_active ? 'Suspend' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleToggleWhitelist(user)}
                              className={`text-xs px-3 py-1 rounded ${
                                user.is_whitelisted
                                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              } transition-colors`}
                            >
                              {user.is_whitelisted ? 'Remove WL' : 'Whitelist'}
                            </button>
                            <button
                              onClick={() => setDeleteUserId(user.id)}
                              className="text-xs px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
                <p className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create User</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@example.com"
                  required
                />
              </div>
              {createError && (
                <div className="flex items-center text-red-600 text-sm">
                  <AlertCircle size={16} className="mr-1" />
                  {createError}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete User</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteUserId(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteUserId)}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminDashboard;
