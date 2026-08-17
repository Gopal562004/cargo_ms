import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Users,
  KeyRound,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  RotateCw,
  X,
  Lock,
  Mail,
  User,
  Building,
  Phone,
  Briefcase,
  Layers,
  Sparkles,
  Zap,
  Check,
  Eye,
  EyeOff,
  Copy,
  AtSign,
} from 'lucide-react';
import {
  fetchUsers,
  createUser,
  updateUser,
  updateUserPassword,
  deleteUser,
  SYSTEM_SERVICES,
} from '../services/userService';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function MasterUsersPage() {
  const { user: currentUser } = useAuthStore();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modal States
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState(null);

  // User Form State
  const [userForm, setUserForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    company: 'DGR GLOBAL LOGISTICS',
    department: 'Accounts & Billing',
    phone: '',
    role: 'OPERATOR',
    isActive: true,
    allowedServices: [
      'SALES_BILLING',
      'PURCHASE_BILLS',
      'BILLING_TEMPLATES',
      'CONTACTS_DIRECTORY',
    ],
  });

  // Password Reset Form State
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const loadUsersData = async () => {
    setLoading(true);
    try {
      const res = await fetchUsers();
      const usersList = res?.data?.users || res?.users || (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
      setUsers(usersList);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsersData();
  }, []);

  const showNotification = (msg, isErr = false) => {
    if (isErr) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 6000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  };

  // ─── Modal Handlers ───────────────────────────────────────────────────────
  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setUserForm({
      name: '',
      username: '',
      email: '',
      password: '',
      company: 'DGR GLOBAL LOGISTICS',
      department: 'Accounts & Billing',
      phone: '',
      role: 'OPERATOR',
      isActive: true,
      allowedServices: [
        'SALES_BILLING',
        'PURCHASE_BILLS',
        'BILLING_TEMPLATES',
        'CONTACTS_DIRECTORY',
      ],
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditModal = (u) => {
    setEditingUser(u);
    setUserForm({
      name: u.name || '',
      username: u.username || '',
      email: u.email || '',
      password: '', // blank when editing
      company: u.company || '',
      department: u.department || 'Operations',
      phone: u.phone || '',
      role: u.role || 'OPERATOR',
      isActive: u.isActive !== undefined ? u.isActive : true,
      allowedServices: Array.isArray(u.allowedServices) ? u.allowedServices : [],
    });
    setIsUserModalOpen(true);
  };

  const handleOpenPasswordModal = (u) => {
    setPasswordTargetUser(u);
    setNewPassword('');
    setCopiedPassword(false);
    setIsPasswordModalOpen(true);
  };

  // ─── Service Allocation Handlers ──────────────────────────────────────────
  const toggleService = (serviceId) => {
    setUserForm((prev) => {
      const exists = prev.allowedServices.includes(serviceId);
      if (exists) {
        return { ...prev, allowedServices: prev.allowedServices.filter((s) => s !== serviceId) };
      } else {
        return { ...prev, allowedServices: [...prev.allowedServices, serviceId] };
      }
    });
  };

  const applyPreset = (presetName) => {
    if (presetName === 'ALL') {
      setUserForm((prev) => ({
        ...prev,
        role: 'ADMIN',
        allowedServices: SYSTEM_SERVICES.map((s) => s.id),
      }));
    } else if (presetName === 'BILLING_ONLY') {
      setUserForm((prev) => ({
        ...prev,
        role: 'OPERATOR',
        department: 'Accounts & Billing',
        allowedServices: ['SALES_BILLING', 'PURCHASE_BILLS', 'BILLING_TEMPLATES', 'CONTACTS_DIRECTORY'],
      }));
    } else if (presetName === 'FREIGHT_OPERATIONS') {
      setUserForm((prev) => ({
        ...prev,
        role: 'OPERATOR',
        department: 'Air & Sea Freight',
        allowedServices: ['AIR_FREIGHT', 'EDI_CARGO', 'SEA_FREIGHT', 'CONTACTS_DIRECTORY', 'TEMPLATES_MANAGEMENT'],
      }));
    } else if (presetName === 'VIEWER') {
      setUserForm((prev) => ({
        ...prev,
        role: 'VIEWER',
        allowedServices: ['AIR_FREIGHT', 'SALES_BILLING', 'CONTACTS_DIRECTORY'],
      }));
    } else if (presetName === 'CLEAR') {
      setUserForm((prev) => ({ ...prev, allowedServices: [] }));
    }
  };

  // ─── Save User Submit ─────────────────────────────────────────────────────
  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!userForm.name.trim()) {
      showNotification('Please enter user full name.', true);
      return;
    }

    if (!userForm.username.trim() && !userForm.email.trim()) {
      showNotification('Please provide a Username or Email for login credentials.', true);
      return;
    }

    if (!editingUser && (!userForm.password || userForm.password.length < 6)) {
      showNotification('Please set a login password of at least 6 characters for the new user.', true);
      return;
    }

    try {
      if (editingUser) {
        await updateUser(editingUser.id, userForm);
        showNotification(`User "${userForm.name}" updated successfully!`);
      } else {
        await createUser(userForm);
        showNotification(`New user "${userForm.name}" created with Username: "${userForm.username || userForm.email}"!`);
      }

      setIsUserModalOpen(false);
      loadUsersData();
    } catch (err) {
      showNotification(err.response?.data?.message || err.message || 'Error saving user', true);
    }
  };

  // ─── Password Reset Submit ────────────────────────────────────────────────
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showNotification('Password must be at least 6 characters long.', true);
      return;
    }

    try {
      await updateUserPassword(passwordTargetUser.id, newPassword);
      showNotification(`Password for ${passwordTargetUser.name} updated successfully!`);
      setIsPasswordModalOpen(false);
    } catch (err) {
      showNotification(err.response?.data?.message || err.message || 'Error updating password', true);
    }
  };

  // ─── Toggle Active / Inactive ─────────────────────────────────────────────
  const handleToggleStatus = async (targetUser) => {
    if (targetUser.id === currentUser?.id) {
      alert('You cannot deactivate your own logged-in account.');
      return;
    }

    const nextStatus = !targetUser.isActive;
    try {
      await updateUser(targetUser.id, { isActive: nextStatus });
      showNotification(`User ${targetUser.name} marked as ${nextStatus ? 'ACTIVE' : 'DEACTIVATED'}.`);
      loadUsersData();
    } catch (err) {
      showNotification(err.response?.data?.message || err.message || 'Error updating status', true);
    }
  };

  // ─── Delete User ──────────────────────────────────────────────────────────
  const handleDeleteUser = async (targetUser) => {
    if (targetUser.id === currentUser?.id) {
      alert('You cannot delete your own account.');
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete user account "${targetUser.name}"?`)) {
      try {
        await deleteUser(targetUser.id);
        showNotification(`User ${targetUser.name} deleted successfully.`);
        loadUsersData();
      } catch (err) {
        showNotification(err.response?.data?.message || err.message || 'Error deleting user', true);
      }
    }
  };

  // Filtered Users list
  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase().trim();
    const matchesQuery =
      !q ||
      (u.name || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.department || '').toLowerCase().includes(q) ||
      (u.company || '').toLowerCase().includes(q);

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && u.isActive) ||
      (statusFilter === 'INACTIVE' && !u.isActive);

    return matchesQuery && matchesRole && matchesStatus;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const adminUsers = users.filter((u) => u.role === 'ADMIN').length;
  const operatorUsers = users.filter((u) => u.role === 'OPERATOR').length;

  if (currentUser && currentUser.role !== 'ADMIN') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4 animate-fade-in">
        <div className="w-16 h-16 rounded bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <Lock size={32} />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-100">Administrator Access Required</h2>
          <p className="text-xs text-slate-400 max-w-md">
            The Master Administration & User Allocation section is strictly restricted to system Administrators.
          </p>
        </div>
        <Button variant="secondary" onClick={() => window.location.href = '/'} className="rounded text-xs">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck size={18} />
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              Master Administration & User Allocation
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Create operator accounts, provision login usernames & passwords, and selectively allocate service & module permissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            onClick={loadUsersData}
            title="Refresh user list"
            className="rounded text-xs"
          >
            <RotateCw size={13} className="mr-1.5 inline" /> Refresh
          </Button>

          <Button
            variant="primary"
            onClick={handleOpenCreateModal}
            className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm"
          >
            <UserPlus size={14} className="mr-1.5 inline" /> Create New User
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded text-xs text-emerald-300 flex items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button type="button" className="text-emerald-400 hover:text-white font-bold text-xs" onClick={() => setSuccessMsg('')}>
            ✕
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded text-xs text-rose-300 flex items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-center gap-2 font-medium">
            <XCircle size={16} className="text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" className="text-rose-400 hover:text-white font-bold text-xs" onClick={() => setErrorMsg('')}>
            ✕
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
            <Users size={18} />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Total Users</div>
            <div className="text-xl font-bold text-slate-100 font-mono">{totalUsers}</div>
          </div>
        </div>

        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Active Accounts</div>
            <div className="text-xl font-bold text-emerald-400 font-mono">{activeUsers}</div>
          </div>
        </div>

        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Administrators</div>
            <div className="text-xl font-bold text-amber-400 font-mono">{adminUsers}</div>
          </div>
        </div>

        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Allocated Operators</div>
            <div className="text-xl font-bold text-cyan-400 font-mono">{operatorUsers}</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded p-3.5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search users by name, username, email, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Administrators</option>
            <option value="OPERATOR">Operators</option>
            <option value="VIEWER">Viewers</option>
          </select>

          <select
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Deactivated</option>
          </select>

          <span className="text-xs text-slate-400 font-mono whitespace-nowrap ml-auto">
            Showing {filteredUsers.length} of {users.length} users
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading master user directory...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users size={36} className="text-slate-600 mx-auto" />
            <p className="text-sm font-medium text-slate-300">No users match your criteria</p>
            <Button variant="primary" size="sm" onClick={handleOpenCreateModal} className="rounded">
              <UserPlus size={14} className="mr-1 inline" /> Create First User
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 min-w-[220px]">User & Login Credentials</th>
                  <th className="py-3 px-4">Role & Department</th>
                  <th className="py-3 px-4 min-w-[280px]">Allocated Services / Permissions</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right min-w-[160px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredUsers.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  const servicesList = Array.isArray(u.allowedServices) ? u.allowedServices : [];
                  const isAdmin = u.role === 'ADMIN';
                  const displayUsername = u.username || (u.email ? u.email.split('@')[0] : 'user');

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Name, Username & Email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                            {u.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded font-mono">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-indigo-400 font-mono font-bold flex items-center gap-1">
                              <AtSign size={11} className="text-indigo-400" />
                              <span>{displayUsername}</span>
                            </div>
                            {u.email ? (
                              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                <Mail size={11} className="text-slate-500" />
                                <span>{u.email}</span>
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-500 italic mt-0.5">
                                Email optional / not set
                              </div>
                            )}
                            {u.phone && (
                              <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Phone size={10} />
                                <span>{u.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role & Department */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              isAdmin
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : u.role === 'OPERATOR'
                                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                                : 'bg-slate-700/50 text-slate-300 border border-slate-600'
                            }`}
                          >
                            {u.role}
                          </span>
                          <div className="text-[11px] text-slate-400">
                            {u.department || 'General Operations'}
                          </div>
                          {u.company && (
                            <div className="text-[10px] text-slate-500 truncate">
                              {u.company}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Allocated Services */}
                      <td className="py-3 px-4">
                        {isAdmin ? (
                          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
                            <ShieldCheck size={14} />
                            <span>Full Master Access (All 9 Modules)</span>
                          </div>
                        ) : servicesList.length === 0 ? (
                          <span className="text-slate-500 italic text-[11px]">No services allocated</span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-sm">
                            {servicesList.map((srvId) => {
                              const srvObj = SYSTEM_SERVICES.find((s) => s.id === srvId);
                              if (!srvObj) return null;
                              return (
                                <span
                                  key={srvId}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${srvObj.color}`}
                                  title={srvObj.description}
                                >
                                  {srvObj.label.split(' ')[0]} {srvObj.label.split(' ')[1] || ''}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          disabled={isCurrent}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase transition-all ${
                            u.isActive
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25'
                          } ${isCurrent ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                          title={isCurrent ? 'Current user active' : 'Click to toggle account status'}
                        >
                          {u.isActive ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                          <span>{u.isActive ? 'ACTIVE' : 'DISABLED'}</span>
                        </button>
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString('en-GB')}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Edit Details & Allocated Services */}
                          <button
                            type="button"
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                            onClick={() => handleOpenEditModal(u)}
                            title="Edit User & Service Allocation"
                          >
                            <Pencil size={14} />
                          </button>

                          {/* Set/Reset Password */}
                          <button
                            type="button"
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                            onClick={() => handleOpenPasswordModal(u)}
                            title="Set / Reset Login Password"
                          >
                            <KeyRound size={14} />
                          </button>

                          {/* Delete Account */}
                          <button
                            type="button"
                            disabled={isCurrent}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            onClick={() => handleDeleteUser(u)}
                            title={isCurrent ? 'Cannot delete current account' : 'Delete User Account'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE / EDIT USER & ALLOCATE SERVICES */}
      {/* ========================================================================= */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-md w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <UserPlus size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100">
                    {editingUser ? `Edit User: ${editingUser.name}` : 'Create New User & Allocate Services'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Define login credentials (Username & Password) and choose which cargo modules & services this user can access.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                onClick={() => setIsUserModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveUser} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
              {/* Section 1: Basic Profile & Credentials */}
              <div className="bg-slate-950/70 border border-slate-800 rounded p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={13} className="text-indigo-400" />
                  <span>1. User Account & Login Credentials</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Full Name *"
                    placeholder="e.g. Mayur Kadam"
                    value={userForm.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setUserForm((prev) => {
                        const updated = { ...prev, name: val };
                        // Auto suggest username if not touched yet
                        if (!editingUser && !prev.username && val.trim()) {
                          updated.username = val.toLowerCase().replace(/\s+/g, '') + '52004';
                        }
                        return updated;
                      });
                    }}
                    required
                  />

                  <Input
                    label="Login Username (Required) *"
                    placeholder="e.g. mayur52004"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    required
                  />

                  <Input
                    label="Email Address (Optional)"
                    type="email"
                    placeholder="e.g. mayur@dgrlogistics.com"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  />
                </div>

                {!editingUser && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Initial Login Password *"
                      type="text"
                      placeholder="e.g. Mayur@2004"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      required
                    />

                    <Input
                      label="Department / Team"
                      placeholder="e.g. Accounts & Billing"
                      value={userForm.department}
                      onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {editingUser && (
                    <Input
                      label="Department / Team"
                      placeholder="e.g. Accounts & Billing"
                      value={userForm.department}
                      onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                    />
                  )}

                  <Input
                    label="Company / Branch"
                    placeholder="e.g. DGR GLOBAL LOGISTICS"
                    value={userForm.company}
                    onChange={(e) => setUserForm({ ...userForm, company: e.target.value })}
                  />

                  <Input
                    label="Phone Number"
                    placeholder="e.g. 9028345261"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  />

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-medium">User Role</label>
                    <select
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    >
                      <option value="OPERATOR">OPERATOR (Standard Staff)</option>
                      <option value="ADMIN">ADMIN (Full Superuser Access)</option>
                      <option value="VIEWER">VIEWER (Read-Only Access)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Service & Module Allocation */}
              <div className="bg-slate-950/70 border border-slate-800 rounded p-4 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div>
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers size={13} className="text-indigo-400" />
                      <span>2. Service & Module Allocation Matrix</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Check the specific tools and sections this user will see upon login.
                    </p>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      className="px-2 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded text-[10px] font-medium"
                      onClick={() => applyPreset('BILLING_ONLY')}
                    >
                      Accounts & Billing Only
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 rounded text-[10px] font-medium"
                      onClick={() => applyPreset('FREIGHT_OPERATIONS')}
                    >
                      Freight Ops Only
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-medium"
                      onClick={() => applyPreset('ALL')}
                    >
                      All Services
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 bg-slate-800 text-slate-400 hover:text-white rounded text-[10px]"
                      onClick={() => applyPreset('CLEAR')}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Services Checkbox Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {SYSTEM_SERVICES.map((srv) => {
                    const isChecked = userForm.allowedServices.includes(srv.id) || userForm.role === 'ADMIN';

                    return (
                      <div
                        key={srv.id}
                        onClick={() => toggleService(srv.id)}
                        className={`p-3 rounded border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isChecked
                            ? 'bg-indigo-600/10 border-indigo-500/50 shadow-sm'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 opacity-70'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center shrink-0 transition-colors ${
                            isChecked
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-600 bg-slate-950'
                          }`}
                        >
                          {isChecked && <Check size={12} />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-slate-100 text-xs">{srv.label}</span>
                            <span className="text-[9.5px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                              {srv.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            {srv.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsUserModalOpen(false)}
                  className="rounded text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  <Check size={14} className="mr-1 inline" />
                  {editingUser ? 'Save User & Allocation' : 'Create User & Issue Credentials'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: RESET PASSWORD MODAL */}
      {/* ========================================================================= */}
      {isPasswordModalOpen && passwordTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-md w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <KeyRound size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">
                    Set Password for {passwordTargetUser.name}
                  </h3>
                  <p className="text-xs text-indigo-400 font-mono">@{passwordTargetUser.username || passwordTargetUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                onClick={() => setIsPasswordModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">New Login Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    className="w-full px-3 py-2 pr-20 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs px-1.5 py-0.5"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-400 space-y-1.5">
                <div className="font-semibold text-slate-300">Quick Generate Password:</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono text-[10px]"
                    onClick={() => {
                      const gen = 'Cargo@' + Math.floor(1000 + Math.random() * 9000);
                      setNewPassword(gen);
                    }}
                  >
                    Generate Random (Cargo@xxxx)
                  </button>
                  {newPassword && (
                    <button
                      type="button"
                      className="px-2 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded font-mono text-[10px] flex items-center gap-1"
                      onClick={() => {
                        navigator.clipboard.writeText(newPassword);
                        setCopiedPassword(true);
                        setTimeout(() => setCopiedPassword(false), 2000);
                      }}
                    >
                      <Copy size={10} />
                      <span>{copiedPassword ? 'Copied!' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <Button type="button" variant="secondary" onClick={() => setIsPasswordModalOpen(false)} className="rounded text-xs">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="rounded text-xs bg-amber-600 hover:bg-amber-500 text-white font-semibold">
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
