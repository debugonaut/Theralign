import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Search, Loader2 } from 'lucide-react';
import { getAllUsersAdminAPI, toggleUserStatusAPI } from '../../api/analytics.api';
import SectionHeader from '../../components/common/SectionHeader';
import Table, { ActionLink } from '../../components/common/Table';
import Badge from '../../components/common/Badge';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Real-time filters state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const LIMIT = 15;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter !== 'all') params.isActive = statusFilter === 'active' ? 'true' : 'false';

      const res = await getAllUsersAdminAPI(params);
      const d = res.data?.data || res.data || {};
      setUsers(d.users || []);
      setTotal(d.total || 0);
      setTotalPages(d.totalPages || 1);
    } catch {
      toast.error('Failed to load user directory');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (userId) => {
    try {
      const res = await toggleUserStatusAPI(userId);
      const u = res.data?.data?.user || res.data?.user || {};
      const nextActive = u.isActive !== false;
      toast.success(`User ${nextActive ? 'activated' : 'deactivated'} successfully`);
      
      // Update in-place
      setUsers((prev) =>
        prev.map((usr) => (usr._id === userId ? { ...usr, isActive: nextActive } : usr))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle user status');
    }
  };

  return (
    <div className="space-y-8 select-none text-neutral-900 bg-white">
      {/* Page Title */}
      <SectionHeader
        title="USERS"
        subtitle="PLATFORM USER AUDIT DIRECTORY, ACCOUNT DEACTIVATIONS, AND MAINTENANCE SYSTEMS."
      />

      {/* Real-time search */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border-2 border-neutral-900 p-4 bg-white">
        
        {/* Full-width Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
          <input
            type="text"
            placeholder="SEARCH USERS BY NAME OR EMAIL..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-white border-2 border-neutral-900 text-xs font-bold uppercase placeholder-neutral-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Role filters segmented controls */}
        <div className="flex border-2 border-neutral-900">
          {['all', 'patient', 'doctor'].map((role) => (
            <button
              key={role}
              onClick={() => { setRoleFilter(role); setPage(1); }}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-r-2 last:border-r-0 border-neutral-900 cursor-pointer ${
                roleFilter === role
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {role === 'all' ? 'ALL ROLES' : role === 'patient' ? 'PATIENTS' : 'DOCTORS'}
            </button>
          ))}
        </div>

        {/* Status filters segmented controls */}
        <div className="flex border-2 border-neutral-900">
          {['all', 'active', 'inactive'].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-r-2 last:border-r-0 border-neutral-900 cursor-pointer ${
                statusFilter === status
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {status === 'all' ? 'ALL STATUS' : status === 'active' ? 'ACTIVE' : 'INACTIVE'}
            </button>
          ))}
        </div>

      </div>

      {/* Directory Table */}
      <div className="bg-white border-2 border-neutral-900 rounded-none shadow-none text-left">
        {loading ? (
          <div className="p-12 text-center text-neutral-500 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
            <Loader2 className="animate-spin h-4 w-4" /> RETRIEVING USER ACCOUNTS...
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 text-ui-sm font-bold uppercase tracking-wider">
            NO USER REGISTRATIONS MATCH FILTERS
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Header>User</Table.Header>
                <Table.Header>Email</Table.Header>
                <Table.Header>Role</Table.Header>
                <Table.Header>Joined</Table.Header>
                <Table.Header>Status</Table.Header>
                <Table.Header actions={true} className="w-[180px]">Actions</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {users.map((u) => {
                const uName = u.name || 'User Record';
                const createdDate = new Date(u.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                });
                
                const isUserActive = u.isActive !== false;
                const isUserAdmin = u.role === 'admin';

                return (
                  <Table.Row key={u._id}>
                    {/* User profile initial circle */}
                    <Table.Cell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {uName[0]}
                        </div>
                        <span className="font-bold text-neutral-900 uppercase tracking-wide text-xs">
                          {uName}
                        </span>
                      </div>
                    </Table.Cell>

                    {/* Email */}
                    <Table.Cell className="font-mono text-xs text-neutral-500">
                      {u.email}
                    </Table.Cell>

                    {/* Role column: neutral badge, no colors! */}
                    <Table.Cell>
                      <Badge variant="neutral" label={u.role?.toUpperCase()} size="sm" />
                    </Table.Cell>

                    {/* Joined */}
                    <Table.Cell className="font-mono text-xs text-neutral-500">
                      {createdDate}
                    </Table.Cell>

                    {/* Status badge: ACTIVE (black border) or INACTIVE (gray border) */}
                    <Table.Cell>
                      {isUserActive ? (
                        <span 
                          style={{ borderColor: '#0F0F0F', color: '#0F0F0F' }}
                          className="border-2 bg-white font-bold uppercase text-[11px] tracking-widest px-2 py-0.5"
                        >
                          ACTIVE
                        </span>
                      ) : (
                        <span 
                          style={{ borderColor: '#A3A3A3', color: '#A3A3A3' }}
                          className="border-2 bg-white font-bold uppercase text-[11px] tracking-widest px-2 py-0.5"
                        >
                          INACTIVE
                        </span>
                      )}
                    </Table.Cell>

                    {/* Actions column: Protected for Admin accounts */}
                    <Table.Cell actions={true}>
                      {isUserAdmin ? (
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest italic pr-4">
                          PROTECTED
                        </span>
                      ) : isUserActive ? (
                        <ActionLink
                          onClick={() => handleToggleStatus(u._id)}
                          className="text-neutral-500 hover:text-neutral-900 hover:underline"
                        >
                          DEACTIVATE
                        </ActionLink>
                      ) : (
                        <ActionLink
                          onClick={() => handleToggleStatus(u._id)}
                          className="text-neutral-900 hover:text-swiss-gray-650 hover:underline"
                        >
                          REACTIVATE
                        </ActionLink>
                      )}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider pt-2 select-none">
          <span className="text-neutral-500">
            PAGE {page} OF {totalPages} · {total} TOTAL REGISTERED ACCOUNTS
          </span>
          <div className="flex gap-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border-2 border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-neutral-900 transition-all shrink-0 cursor-pointer"
            >
              ← PREV
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border-2 border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-neutral-900 transition-all shrink-0 cursor-pointer"
            >
              NEXT →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
