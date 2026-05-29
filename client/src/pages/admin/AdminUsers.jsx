import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Search, UserCheck, UserX, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllUsersAdminAPI, toggleUserStatusAPI } from '../../api/analytics.api';
import PageHeader from '../../components/admin/PageHeader';

const ROLE_COLORS = {
  patient: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  doctor:  'bg-green-500/10 text-green-400 border border-green-500/20',
  admin:   'bg-purple-500/10 text-purple-400 border border-purple-500/20',
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);

  const LIMIT = 20;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (activeFilter !== '') params.isActive = activeFilter;

      const res = await getAllUsersAdminAPI(params);
      const d = res.data.data;
      setUsers(d.users || []);
      setTotal(d.total || 0);
      setTotalPages(d.totalPages || 1);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, activeFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleToggleStatus = async (userId) => {
    setConfirmingId(null);
    try {
      const res = await toggleUserStatusAPI(userId);
      const { isActive, name } = res.data.data.user;
      toast.success(`${name} ${isActive ? 'activated' : 'deactivated'} successfully`);
      // Update in-place
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive } : u))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const FILTER_TABS = [
    { label: 'All', role: '', active: '' },
    { label: 'Patients', role: 'patient', active: '' },
    { label: 'Doctors', role: 'doctor', active: '' },
    { label: 'Active Only', role: '', active: 'true' },
    { label: 'Inactive', role: '', active: 'false' },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="User Management"
        subtitle={`${total} total users on the platform`}
      />

      {/* Search + Filters */}
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all"
          >
            Search
          </button>
        </form>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTER_TABS.map((tab) => {
            const isActive = roleFilter === tab.role && activeFilter === tab.active;
            return (
              <button
                key={tab.label}
                onClick={() => {
                  setRoleFilter(tab.role);
                  setActiveFilter(tab.active);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-sm">No users found matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5 hidden md:table-cell">Joined</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b border-slate-800/50 hover:bg-slate-900/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs shrink-0">
                          {u.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="font-medium text-slate-200 truncate max-w-[120px]">
                          {u.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs font-mono truncate max-w-[160px]">
                      {u.email}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_COLORS[u.role] || 'bg-slate-800 text-slate-400'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-slate-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4">
                      {u.isActive !== false ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {u.role === 'admin' ? (
                        <span className="text-xs text-slate-600 italic">Protected</span>
                      ) : confirmingId === u._id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-slate-400">Confirm?</span>
                          <button
                            onClick={() => handleToggleStatus(u._id)}
                            className="text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 px-2 py-1 rounded-lg transition-all"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmingId(null)}
                            className="text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-800 px-2 py-1 rounded-lg transition-all"
                          >
                            No
                          </button>
                        </div>
                      ) : u.isActive !== false ? (
                        <button
                          onClick={() => setConfirmingId(u._id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 px-2.5 py-1 rounded-lg transition-all"
                        >
                          <UserX size={12} /> Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(u._id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-green-400 border border-green-500/30 hover:bg-green-500/10 px-2.5 py-1 rounded-lg transition-all"
                        >
                          <UserCheck size={12} /> Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Page {page} of {totalPages} · {total} total users
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
