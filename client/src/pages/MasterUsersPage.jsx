import React, { useState, useEffect, useMemo } from 'react';
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
  Calendar,
  Clock,
  Activity,
  AlertTriangle,
  FileText,
  CreditCard,
  Send,
  Sliders,
  Filter,
  CheckSquare,
  Square,
  Shield,
  HelpCircle,
  Info,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  PlusCircle,
  ArrowUpRight,
} from 'lucide-react';
import {
  fetchUsers,
  createUser,
  updateUser,
  updateUserPassword,
  extendUserSubscription,
  regenerateUserLicenseKey,
  fetchUserActivityLogs,
  deleteUser,
  SYSTEM_SERVICES,
  SUBSCRIPTION_PLANS,
  DURATION_PRESETS,
} from '../services/userService';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

export default function MasterUsersPage() {
  const { user: currentUser } = useAuthStore();
  const { theme } = useThemeStore();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityTargetUser, setActivityTargetUser] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // User Complete Info Modal
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoTargetUser, setInfoTargetUser] = useState(null);

  // Custom Confirmation Modal
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'danger', // 'danger' | 'warning' | 'primary'
    onConfirm: () => {},
  });

  // Quick Action feedback
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [copiedHandoverId, setCopiedHandoverId] = useState(null);

  useBodyScrollLock(Boolean(isUserModalOpen || isPasswordModalOpen || isActivityModalOpen || isInfoModalOpen || confirmDialog.isOpen));

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
    subscriptionPlan: 'STARTER',
    subscriptionDuration: '1_YEAR',
    customExpiresAt: '',
    subscriptionStatus: 'ACTIVE',
    maxSeats: 1,
    notes: '',
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
      // Update infoTargetUser if open
      if (infoTargetUser) {
        const updated = usersList.find((u) => u.id === infoTargetUser.id);
        if (updated) setInfoTargetUser(updated);
      }
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

  // Helper to open custom confirmation dialog
  const promptConfirm = ({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger', onConfirm }) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      variant,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        if (onConfirm) await onConfirm();
      },
    });
  };

  // Helper to calculate expiry date string for form preview
  const getCalculatedExpiryPreview = (duration, customDate, baseDate = new Date()) => {
    if (duration === 'CANCELLED') {
      return 'Immediate Expiration / Terminated';
    }
    if (duration === 'CUSTOM' && customDate) {
      return new Date(customDate).toLocaleDateString('en-IN', { dateStyle: 'medium' });
    }
    const d = new Date(baseDate);
    switch (duration) {
      case '7_DAYS':
        d.setDate(d.getDate() + 7);
        break;
      case '1_MONTH':
        d.setMonth(d.getMonth() + 1);
        break;
      case '3_MONTHS':
        d.setMonth(d.getMonth() + 3);
        break;
      case '6_MONTHS':
        d.setMonth(d.getMonth() + 6);
        break;
      case '1_YEAR':
      default:
        d.setFullYear(d.getFullYear() + 1);
        break;
    }
    return d.toLocaleDateString('en-IN', { dateStyle: 'medium' });
  };

  // ─── Modal Handlers ───────────────────────────────────────────────────────
  const handleOpenInfoModal = (u) => {
    setInfoTargetUser(u);
    setIsInfoModalOpen(true);
  };

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
      subscriptionPlan: 'STARTER',
      subscriptionDuration: '1_YEAR',
      customExpiresAt: '',
      subscriptionStatus: 'ACTIVE',
      maxSeats: 1,
      notes: '',
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
    const isCancelled = u.subscriptionStatus === 'CANCELLED' || u.subscriptionPlan === 'NO_ACTIVE_PLAN';
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
      subscriptionPlan: isCancelled ? 'STARTER' : (u.subscriptionPlan || 'STARTER'),
      subscriptionDuration: isCancelled ? '1_MONTH' : (u.subscriptionDuration || '1_YEAR'),
      customExpiresAt: u.subscriptionExpiresAt ? new Date(u.subscriptionExpiresAt).toISOString().split('T')[0] : '',
      subscriptionStatus: 'ACTIVE',
      maxSeats: u.maxSeats || 1,
      notes: u.notes || '',
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

  const handleOpenActivityModal = async (u) => {
    setActivityTargetUser(u);
    setIsActivityModalOpen(true);
    setLoadingActivity(true);
    try {
      const res = await fetchUserActivityLogs(u.id);
      setActivityLogs(res?.data?.logs || []);
    } catch (err) {
      showNotification('Failed to load user activity trail: ' + (err.response?.data?.message || err.message), true);
    } finally {
      setLoadingActivity(false);
    }
  };

  // ─── Quick Actions ────────────────────────────────────────────────────────
  const handleCopyLicenseKey = (u) => {
    if (!u.licenseKey) return;
    navigator.clipboard.writeText(u.licenseKey);
    setCopiedKeyId(u.id);
    showNotification(`License Key for ${u.name} copied to clipboard!`);
    setTimeout(() => setCopiedKeyId(null), 3000);
  };

  const handleCopyClientHandover = (u) => {
    const handoverText = `CargoHub Logistics OS — Client Access Credentials
--------------------------------------------------
Customer: ${u.name} (${u.company || 'Enterprise'})
Username / Login ID: ${u.username || u.email}
Login Email: ${u.email || 'N/A'}
Subscription Plan: ${u.subscriptionPlan || 'Standard'}
License Key: ${u.licenseKey || 'N/A'}
Plan Expiry Date: ${u.subscriptionExpiresAt ? new Date(u.subscriptionExpiresAt).toLocaleDateString('en-IN') : 'Active (Annual)'}

Web Access Link: ${window.location.origin}/login
Desktop App (.exe): Download from Client Portal
--------------------------------------------------
Please keep your credentials secure.`;

    navigator.clipboard.writeText(handoverText);
    setCopiedHandoverId(u.id);
    showNotification(`Client Handover details for ${u.name} copied! Ready to send to customer.`);
    setTimeout(() => setCopiedHandoverId(null), 3000);
  };

  const handleQuickExtend = (u, durationType) => {
    const durationLabel = durationType.replace('_', ' ');
    promptConfirm({
      title: `Extend Subscription: ${u.name}`,
      message: `Are you sure you want to add ${durationLabel} to ${u.name}'s current subscription?`,
      confirmText: `Yes, Extend +${durationLabel}`,
      variant: 'primary',
      onConfirm: async () => {
        try {
          await extendUserSubscription(u.id, { extensionType: durationType });
          showNotification(`Subscription extended by ${durationLabel} for ${u.name}!`);
          loadUsersData();
        } catch (err) {
          showNotification(err.response?.data?.message || err.message || 'Error extending plan', true);
        }
      },
    });
  };

  const handleQuickCancelSubscription = (u) => {
    promptConfirm({
      title: `Cancel Subscription: ${u.name}`,
      message: `Are you sure you want to cancel the subscription for ${u.name}? Their plan will be immediately terminated and marked as Expired.`,
      confirmText: 'Yes, Cancel Subscription',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await updateUser(u.id, {
            subscriptionDuration: 'CANCELLED',
          });
          showNotification(`Subscription for ${u.name} has been cancelled.`);
          loadUsersData();
        } catch (err) {
          showNotification(err.response?.data?.message || err.message || 'Error cancelling plan', true);
        }
      },
    });
  };

  const handleToggleStatus = (u) => {
    const newStatus = u.isActive ? false : true;
    const actionLabel = newStatus ? 'Activate' : 'Suspend / Deactivate';

    promptConfirm({
      title: `${actionLabel} User: ${u.name}`,
      message: newStatus
        ? `Are you sure you want to activate ${u.name}? They will regain full access to their allocated modules.`
        : `Are you sure you want to suspend ${u.name}? They will immediately be locked out from creating invoices and documents.`,
      confirmText: `Yes, ${actionLabel}`,
      variant: newStatus ? 'primary' : 'danger',
      onConfirm: async () => {
        try {
          await updateUser(u.id, {
            isActive: newStatus,
            subscriptionStatus: newStatus ? 'ACTIVE' : 'SUSPENDED',
          });
          showNotification(`User ${u.name} is now ${newStatus ? 'ACTIVE' : 'SUSPENDED'}`);
          loadUsersData();
        } catch (err) {
          showNotification(err.response?.data?.message || err.message || 'Error updating status', true);
        }
      },
    });
  };

  const handleRegenerateKey = (u) => {
    promptConfirm({
      title: `Re-issue License Key: ${u.name}`,
      message: `Are you sure you want to generate a new License Key for ${u.name}? The previous key will be permanently invalidated immediately.`,
      confirmText: 'Yes, Re-issue Key',
      variant: 'warning',
      onConfirm: async () => {
        try {
          const res = await regenerateUserLicenseKey(u.id);
          showNotification(`New License Key generated: ${res?.data?.licenseKey}`);
          loadUsersData();
        } catch (err) {
          showNotification(err.response?.data?.message || err.message || 'Error regenerating key', true);
        }
      },
    });
  };

  const handleDeleteUser = (u) => {
    promptConfirm({
      title: `Delete / Deactivate User: ${u.name}`,
      message: `Are you sure you want to deactivate ${u.name}'s account? All existing invoices and documents will be preserved, but the user login will be disabled.`,
      confirmText: 'Yes, Deactivate User',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteUser(u.id);
          showNotification(`User ${u.name} deactivated successfully.`);
          setIsInfoModalOpen(false);
          loadUsersData();
        } catch (err) {
          showNotification(err.response?.data?.message || err.message || 'Error deleting user', true);
        }
      },
    });
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

    promptConfirm({
      title: editingUser ? `Update User: ${editingUser.name}` : `Create New User: ${userForm.name}`,
      message: editingUser
        ? `Are you sure you want to save subscription & permission changes for ${editingUser.name}?`
        : `Are you sure you want to create user "${userForm.name}" with Username "${userForm.username || userForm.email}" and plan "${userForm.subscriptionPlan}"?`,
      confirmText: editingUser ? 'Yes, Save Changes' : 'Yes, Create User',
      variant: 'primary',
      onConfirm: async () => {
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
      },
    });
  };

  // ─── Password Reset Submit ────────────────────────────────────────────────
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showNotification('Password must be at least 6 characters long.', true);
      return;
    }

    promptConfirm({
      title: `Reset Password: ${passwordTargetUser.name}`,
      message: `Are you sure you want to update the login password for ${passwordTargetUser.name}?`,
      confirmText: 'Yes, Update Password',
      variant: 'warning',
      onConfirm: async () => {
        try {
          await updateUserPassword(passwordTargetUser.id, newPassword);
          showNotification(`Password for ${passwordTargetUser.name} updated successfully!`);
          setIsPasswordModalOpen(false);
        } catch (err) {
          showNotification(err.response?.data?.message || err.message || 'Error updating password', true);
        }
      },
    });
  };

  // ─── Filtered Users & Metric Counts ───────────────────────────────────────
  const metrics = useMemo(() => {
    let total = users.length;
    let active = 0;
    let expiringSoon = 0;
    let expired = 0;
    let suspended = 0;

    users.forEach((u) => {
      if (!u.isActive || u.subscriptionStatus === 'SUSPENDED' || u.subscriptionStatus === 'INACTIVE') {
        suspended++;
      } else if (u.isExpired) {
        expired++;
      } else {
        active++;
        if (u.daysRemaining !== null && u.daysRemaining <= 15 && u.daysRemaining > 0) {
          expiringSoon++;
        }
      }
    });

    return { total, active, expiringSoon, expired, suspended };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchQuery =
        !search ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.company && u.company.toLowerCase().includes(q)) ||
        (u.licenseKey && u.licenseKey.toLowerCase().includes(q));

      if (!matchQuery) return false;

      // Plan Filter
      if (planFilter !== 'ALL' && (u.subscriptionPlan || 'STARTER') !== planFilter) {
        return false;
      }

      // Role Filter
      if (roleFilter !== 'ALL' && u.role !== roleFilter) {
        return false;
      }

      // Status Filter
      if (statusFilter === 'ACTIVE') {
        if (!u.isActive || u.isExpired) return false;
      } else if (statusFilter === 'EXPIRING_SOON') {
        if (!u.isActive || u.isExpired || u.daysRemaining === null || u.daysRemaining > 15) return false;
      } else if (statusFilter === 'EXPIRED') {
        if (!u.isExpired) return false;
      } else if (statusFilter === 'SUSPENDED') {
        if (u.isActive && u.subscriptionStatus !== 'SUSPENDED') return false;
      }

      return true;
    });
  }, [users, search, planFilter, statusFilter, roleFilter]);

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
              Master User & Subscription Administration
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Create operator logins, assign subscription durations, auto-generate License Keys, and monitor user audit trails. Click on any user to view full profile & subscription details.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            onClick={loadUsersData}
            className="rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-200"
            title="Refresh Users"
          >
            <RotateCw size={13} className={`mr-1.5 inline ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>

          <Button
            variant="primary"
            onClick={handleOpenCreateModal}
            className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-950/40"
          >
            <UserPlus size={14} /> Create User & License
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded text-xs text-emerald-300 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded text-xs text-rose-300 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle size={16} className="text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg('')} className="text-rose-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded space-y-0.5 shadow-sm">
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <Users size={13} className="text-indigo-400" /> Total Users
          </div>
          <div className="text-xl font-bold text-slate-100 font-mono">{metrics.total}</div>
        </div>

        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded space-y-0.5 shadow-sm">
          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
            <CheckCircle2 size={13} /> Active Plans
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">{metrics.active}</div>
        </div>

        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded space-y-0.5 shadow-sm">
          <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1.5">
            <Clock size={13} /> Expiring &lt;15d
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">{metrics.expiringSoon}</div>
        </div>

        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded space-y-0.5 shadow-sm">
          <div className="text-[11px] text-rose-400 font-medium flex items-center gap-1.5">
            <XCircle size={13} /> Expired
          </div>
          <div className="text-xl font-bold text-rose-400 font-mono">{metrics.expired}</div>
        </div>

        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded space-y-0.5 shadow-sm col-span-2 sm:col-span-1">
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <Lock size={13} className="text-slate-500" /> Suspended
          </div>
          <div className="text-xl font-bold text-slate-400 font-mono">{metrics.suspended}</div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-slate-900/70 border border-slate-800 rounded p-3.5 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search user name, username, email, company, license key..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Plan Tier Filter */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-2.5 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Plans</option>
              <option value="FREE_TRIAL">Free Trial</option>
              <option value="STARTER">Starter</option>
              <option value="PROFESSIONAL">Professional</option>
              <option value="ENTERPRISE">Enterprise</option>
              <option value="CUSTOM">Custom</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="EXPIRING_SOON">Expiring Soon (&lt;15d)</option>
              <option value="EXPIRED">Expired</option>
              <option value="SUSPENDED">Suspended / Inactive</option>
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="OPERATOR">OPERATOR</option>
              <option value="VIEWER">VIEWER</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3.5">User & Credentials</th>
                <th className="py-3 px-3.5">Company & Dept</th>
                <th className="py-3 px-3.5">License Key</th>
                <th className="py-3 px-3.5">Subscription Plan</th>
                <th className="py-3 px-3.5">Plan Expiry</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-mono">
                    <RotateCw size={18} className="animate-spin inline mr-2 text-indigo-400" />
                    Loading user directory & subscriptions...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-mono">
                    No matching users found. Click "Create User & License" to issue a new operator license.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  const isExpiring = u.daysRemaining !== null && u.daysRemaining <= 15 && u.daysRemaining > 0;
                  const isExpired = u.isExpired;
                  const isSuspended = !u.isActive || u.subscriptionStatus === 'SUSPENDED';

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors group">
                      {/* 1. User & Credentials — Click to open User Profile Info Modal */}
                      <td
                        className="py-3 px-3.5 cursor-pointer"
                        onClick={() => handleOpenInfoModal(u)}
                        title="Click to view complete user & subscription details"
                      >
                        <div className="font-bold text-slate-100 flex items-center gap-1.5 group-hover:text-indigo-400 transition-colors">
                          <span>{u.name}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-mono">
                              YOU
                            </span>
                          )}
                          <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400 ml-0.5" />
                        </div>
                        <div className="text-[11px] font-mono text-indigo-400 flex items-center gap-1 mt-0.5">
                          <AtSign size={10} /> {u.username || u.email}
                        </div>
                        {u.email && u.email !== u.username && (
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[170px]">{u.email}</div>
                        )}
                      </td>

                      {/* 2. Company & Dept */}
                      <td className="py-3 px-3.5">
                        <div className="font-medium text-slate-200">{u.company || '—'}</div>
                        <div className="text-[10px] text-slate-400">{u.department || 'Operations'}</div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                          Role: <span className="text-slate-300 font-semibold">{u.role}</span>
                        </div>
                      </td>

                      {/* 3. License Key */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[11px] text-slate-200 px-2 py-1 rounded bg-slate-950 border border-slate-800 select-all">
                            {u.licenseKey || 'CRGO-2026-LEGACY'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyLicenseKey(u);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Copy License Key"
                          >
                            {copiedKeyId === u.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          </button>
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                          Seats: {u.maxSeats || 1} Operator{u.maxSeats === 1 ? '' : 's'}
                        </div>
                      </td>

                      {/* 4. Subscription Plan */}
                      <td className="py-3 px-3.5">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold border bg-indigo-500/15 text-indigo-300 border-indigo-500/30">
                          {u.subscriptionPlan || 'STARTER'}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {(u.allowedServices || []).length} module{(u.allowedServices || []).length === 1 ? '' : 's'} enabled
                        </div>
                      </td>

                      {/* 5. Plan Expiry & Countdown */}
                      <td className="py-3 px-3.5 font-mono">
                        {u.subscriptionExpiresAt ? (
                          <>
                            <div className="text-slate-200 font-medium">
                              {new Date(u.subscriptionExpiresAt).toLocaleDateString('en-IN')}
                            </div>
                            <div
                              className={`text-[10px] font-bold ${
                                isExpired
                                  ? 'text-rose-400'
                                  : isExpiring
                                  ? 'text-amber-400 animate-pulse'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {isExpired
                                ? 'EXPIRED'
                                : u.daysRemaining !== null
                                ? `${u.daysRemaining} days remaining`
                                : 'Active'}
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400">1 Year (Default)</span>
                        )}
                      </td>

                      {/* 6. Status Badge */}
                      <td className="py-3 px-3.5">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <XCircle size={11} /> Suspended
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <Clock size={11} /> Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 size={11} /> Active
                          </span>
                        )}
                      </td>

                      {/* 7. Action Buttons */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {/* Complete User Info Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenInfoModal(u)}
                            className="p-1.5 text-slate-400 hover:text-indigo-300 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                            title="View Full User Info & Subscription Card"
                          >
                            <Info size={13} />
                          </button>

                          {/* Copy Handover Text */}
                          <button
                            type="button"
                            onClick={() => handleCopyClientHandover(u)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Copy Full Client Handover Details (Credentials + Key)"
                          >
                            {copiedHandoverId === u.id ? <Check size={13} className="text-emerald-400" /> : <Send size={13} />}
                          </button>

                          {/* Quick Extend +1 Month */}
                          <button
                            type="button"
                            onClick={() => handleQuickExtend(u, '1_MONTH')}
                            className="px-1.5 py-1 text-[10px] font-mono text-emerald-400 hover:bg-emerald-500/10 rounded border border-emerald-500/20 transition-colors cursor-pointer"
                            title="Quick Extend Subscription (+1 Month)"
                          >
                            +1M
                          </button>

                          {/* Quick Extend +1 Year */}
                          <button
                            type="button"
                            onClick={() => handleQuickExtend(u, '1_YEAR')}
                            className="px-1.5 py-1 text-[10px] font-mono text-indigo-400 hover:bg-indigo-500/10 rounded border border-indigo-500/20 transition-colors cursor-pointer"
                            title="Quick Extend Subscription (+1 Full Year)"
                          >
                            +1Y
                          </button>

                          {/* Activity Trail */}
                          <button
                            type="button"
                            onClick={() => handleOpenActivityModal(u)}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                            title="View Activity & Audit Trail"
                          >
                            <Activity size={13} />
                          </button>

                          {/* Reset Password */}
                          <button
                            type="button"
                            onClick={() => handleOpenPasswordModal(u)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Reset Login Password"
                          >
                            <KeyRound size={13} />
                          </button>

                          {/* Edit User & Subscription */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit User Profile & Plan"
                          >
                            <Pencil size={13} />
                          </button>

                          {/* Activate / Suspend Toggle */}
                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(u)}
                              className={`p-1.5 rounded transition-colors cursor-pointer ${
                                u.isActive
                                  ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                                  : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                              }`}
                              title={u.isActive ? 'Suspend / Deactivate User' : 'Activate User'}
                            >
                              <Lock size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── COMPLETE USER PROFILE & SUBSCRIPTION INFO MODAL ─────────────────── */}
      {isInfoModalOpen && infoTargetUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto"
          onClick={() => setIsInfoModalOpen(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-md max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center font-bold text-lg text-indigo-400 uppercase font-mono">
                  {infoTargetUser.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-100">{infoTargetUser.name}</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {infoTargetUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                    <span>@{infoTargetUser.username || infoTargetUser.email}</span>
                    {infoTargetUser.email && <span>• {infoTargetUser.email}</span>}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInfoModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* 1. Subscription & Plan Live Status Card */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="font-bold text-slate-200 flex items-center gap-2">
                    <CreditCard size={15} className="text-emerald-400" />
                    <span>Current Subscription & Plan Details</span>
                  </div>
                  {infoTargetUser.isExpired ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                      EXPIRED
                    </span>
                  ) : !infoTargetUser.isActive ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      SUSPENDED
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      ACTIVE & RUNNING
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Plan Tier</span>
                    <span className="font-bold text-slate-100 text-sm">
                      {infoTargetUser.subscriptionPlan || 'STARTER'}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Expiry Date</span>
                    <span className="font-bold text-slate-100 font-mono text-xs">
                      {infoTargetUser.subscriptionExpiresAt
                        ? new Date(infoTargetUser.subscriptionExpiresAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })
                        : '1 Year (Default)'}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Remaining Validity</span>
                    <span
                      className={`font-bold font-mono text-xs ${
                        infoTargetUser.isExpired
                          ? 'text-rose-400'
                          : infoTargetUser.daysRemaining <= 15
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {infoTargetUser.isExpired
                        ? 'Expired'
                        : `${infoTargetUser.daysRemaining ?? 365} Days Left`}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Operator Seats</span>
                    <span className="font-bold text-slate-100 font-mono">
                      {infoTargetUser.maxSeats || 1} Seat{infoTargetUser.maxSeats === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                {/* License Key Display & Copy */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">License Key:</span>
                    <span className="font-mono font-bold text-xs text-indigo-300 px-2 py-1 rounded bg-slate-900 border border-slate-800 select-all">
                      {infoTargetUser.licenseKey || 'CRGO-2026-LEGACY'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopyLicenseKey(infoTargetUser)}
                      className="text-[11px] py-1 px-2.5 rounded bg-slate-900 border border-slate-800"
                    >
                      <Copy size={12} className="mr-1" /> Copy Key
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRegenerateKey(infoTargetUser)}
                      className="text-[11px] py-1 px-2.5 rounded text-amber-400 bg-amber-500/10 border border-amber-500/20"
                    >
                      <RefreshCw size={12} className="mr-1" /> Re-issue Key
                    </Button>
                  </div>
                </div>
              </div>

              {/* 2. Quick Plan Extension & Renewal Section */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-3">
                <div className="font-bold text-slate-200 flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <PlusCircle size={15} className="text-indigo-400" />
                    <span>Extend Plan / Add Duration</span>
                  </div>
                  <span className="text-[10px] text-slate-400">1-click instant subscription extension</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickExtend(infoTargetUser, '1_MONTH')}
                    className="p-2.5 rounded bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400">+1 Month</div>
                    <div className="text-[10px] text-slate-400">Adds 30 days</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickExtend(infoTargetUser, '3_MONTHS')}
                    className="p-2.5 rounded bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400">+3 Months</div>
                    <div className="text-[10px] text-slate-400">Adds 90 days</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickExtend(infoTargetUser, '6_MONTHS')}
                    className="p-2.5 rounded bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400">+6 Months</div>
                    <div className="text-[10px] text-slate-400">Adds 180 days</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickExtend(infoTargetUser, '1_YEAR')}
                    className="p-2.5 rounded bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-400">+1 Full Year</div>
                    <div className="text-[10px] text-slate-400">Adds 365 days</div>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Terminate plan before natural expiration?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsInfoModalOpen(false);
                      handleQuickCancelSubscription(infoTargetUser);
                    }}
                    className="px-2.5 py-1 text-xs rounded font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                  >
                    🚫 Cancel & Expire Plan
                  </button>
                </div>
              </div>

              {/* 3. Company, Contact & Quotas */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2.5">
                <div className="font-bold text-slate-200 text-xs border-b border-slate-800 pb-1.5 flex items-center gap-2">
                  <Building size={14} className="text-indigo-400" />
                  <span>Company & Department Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Company / Client</span>
                    <span className="font-medium text-slate-200">{infoTargetUser.company || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Department</span>
                    <span className="font-medium text-slate-200">{infoTargetUser.department || 'Operations'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Phone Number</span>
                    <span className="font-medium text-slate-200 font-mono">{infoTargetUser.phone || '—'}</span>
                  </div>
                </div>

                {infoTargetUser.notes && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono mb-0.5">Admin Contract Notes</span>
                    <p className="text-slate-300 italic bg-slate-900 p-2 rounded border border-slate-800">
                      "{infoTargetUser.notes}"
                    </p>
                  </div>
                )}
              </div>

              {/* 4. Active Modular Services */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2.5">
                <div className="font-bold text-slate-200 text-xs border-b border-slate-800 pb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders size={14} className="text-indigo-400" />
                    <span>Allocated Services ({(infoTargetUser.allowedServices || []).length} Active)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsInfoModalOpen(false);
                      handleOpenEditModal(infoTargetUser);
                    }}
                    className="text-[11px] text-indigo-400 hover:underline cursor-pointer"
                  >
                    Edit Permissions
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SYSTEM_SERVICES.map((srv) => {
                    const isAllocated = (infoTargetUser.allowedServices || []).includes(srv.id);
                    return (
                      <div
                        key={srv.id}
                        className={`p-2 rounded border flex items-center justify-between ${
                          isAllocated
                            ? 'bg-indigo-600/10 border-indigo-500/40 text-slate-200'
                            : 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-60'
                        }`}
                      >
                        <span className="font-medium text-xs">{srv.label}</span>
                        {isAllocated ? (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 font-mono">
                            <Check size={12} /> ON
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">OFF</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsInfoModalOpen(false);
                    handleOpenActivityModal(infoTargetUser);
                  }}
                  className="rounded text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
                >
                  <Activity size={13} className="mr-1" /> View Audit Trail
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsInfoModalOpen(false);
                    handleOpenPasswordModal(infoTargetUser);
                  }}
                  className="rounded text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
                >
                  <KeyRound size={13} className="mr-1" /> Reset Password
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setIsInfoModalOpen(false);
                    handleOpenEditModal(infoTargetUser);
                  }}
                  className="rounded text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  <Pencil size={13} className="mr-1" /> Edit Profile & Plan
                </Button>

                {currentUser?.id !== infoTargetUser.id && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteUser(infoTargetUser)}
                    className="rounded text-xs"
                  >
                    <Trash2 size={13} className="mr-1" /> Deactivate
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── CREATE / EDIT USER MODAL ───────────────────────────────────────── */}
      {isUserModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto"
          onClick={() => setIsUserModalOpen(false)}
        >
          <div
            className={`rounded-lg max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[92vh] flex flex-col border ${
              theme === 'light'
                ? 'bg-white border-slate-200 text-slate-900'
                : 'bg-slate-900 border-slate-800 text-slate-100'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`flex items-center justify-between border-b pb-3 shrink-0 ${
              theme === 'light' ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded flex items-center justify-center border ${
                  theme === 'light'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                    : 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400'
                }`}>
                  <UserPlus size={16} />
                </div>
                <div>
                  <h2 className={`text-base font-bold tracking-tight ${
                    theme === 'light' ? 'text-slate-900' : 'text-slate-100'
                  }`}>
                    {editingUser ? `Edit User: ${editingUser.name}` : 'Create New User & Issue License'}
                  </h2>
                  <p className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    Assign subscription plan, duration, modular permissions, and credentials.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  theme === 'light' ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form onSubmit={handleSaveUser} className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* 1. Profile & Credentials */}
              <div className={`p-3.5 rounded-lg border space-y-3 ${
                theme === 'light' ? 'bg-slate-50/70 border-slate-200 shadow-xs' : 'bg-slate-950/80 border-slate-800'
              }`}>
                <div className={`font-bold text-xs flex items-center gap-1.5 border-b pb-1.5 ${
                  theme === 'light' ? 'text-slate-800 border-slate-200' : 'text-slate-200 border-slate-800'
                }`}>
                  <User size={13} className={theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'} />
                  <span>1. User Profile & Login Credentials</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`text-[11px] font-semibold block mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Mayur Kadam"
                      value={userForm.name}
                      onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))}
                      required
                      className={`w-full px-3 py-1.5 rounded text-xs transition-colors focus:outline-none ${
                        theme === 'light'
                          ? 'bg-white border border-slate-300 text-slate-900 focus:border-indigo-600 shadow-xs'
                          : 'bg-slate-900 border border-slate-800 text-slate-100 focus:border-indigo-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-[11px] font-semibold block mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Login Username *</label>
                    <input
                      type="text"
                      placeholder="e.g. mayur52004 or accounts@manifest.com"
                      value={userForm.username}
                      onChange={(e) => setUserForm((prev) => ({ ...prev, username: e.target.value }))}
                      required
                      className={`w-full px-3 py-1.5 rounded text-xs font-mono transition-colors focus:outline-none ${
                        theme === 'light'
                          ? 'bg-white border border-slate-300 text-slate-900 focus:border-indigo-600 shadow-xs'
                          : 'bg-slate-900 border border-slate-800 text-slate-100 focus:border-indigo-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-[11px] font-semibold block mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Email Address (Optional)</label>
                    <input
                      type="email"
                      placeholder="e.g. mayur@dgrlogistics.com"
                      value={userForm.email}
                      onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
                      className={`w-full px-3 py-1.5 rounded text-xs font-mono transition-colors focus:outline-none ${
                        theme === 'light'
                          ? 'bg-white border border-slate-300 text-slate-900 focus:border-indigo-600 shadow-xs'
                          : 'bg-slate-900 border border-slate-800 text-slate-100 focus:border-indigo-500'
                      }`}
                    />
                  </div>

                  {!editingUser && (
                    <div>
                      <label className={`text-[11px] font-semibold block mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Initial Password *</label>
                      <input
                        type="password"
                        placeholder="•••••••• (min 6 chars)"
                        value={userForm.password}
                        onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))}
                        required
                        className={`w-full px-3 py-1.5 rounded text-xs font-mono transition-colors focus:outline-none ${
                          theme === 'light'
                            ? 'bg-white border border-slate-300 text-slate-900 focus:border-indigo-600 shadow-xs'
                            : 'bg-slate-900 border border-slate-800 text-slate-100 focus:border-indigo-500'
                        }`}
                      />
                    </div>
                  )}

                  <div>
                    <label className={`text-[11px] font-semibold block mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Company / Agency Name</label>
                    <input
                      type="text"
                      placeholder="e.g. DGR GLOBAL LOGISTICS"
                      value={userForm.company}
                      onChange={(e) => setUserForm((prev) => ({ ...prev, company: e.target.value }))}
                      className={`w-full px-3 py-1.5 rounded text-xs transition-colors focus:outline-none ${
                        theme === 'light'
                          ? 'bg-white border border-slate-300 text-slate-900 focus:border-indigo-600 shadow-xs'
                          : 'bg-slate-900 border border-slate-800 text-slate-100 focus:border-indigo-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-[11px] font-semibold block mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>System Role</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm((prev) => ({ ...prev, role: e.target.value }))}
                      className={`w-full px-3 py-1.5 rounded text-xs transition-colors focus:outline-none ${
                        theme === 'light'
                          ? 'bg-white border border-slate-300 text-slate-900 focus:border-indigo-600 shadow-xs'
                          : 'bg-slate-900 border border-slate-800 text-slate-100 focus:border-indigo-500'
                      }`}
                    >
                      <option value="OPERATOR">OPERATOR (Standard User)</option>
                      <option value="ADMIN">ADMIN (Full Master Control)</option>
                      <option value="VIEWER">VIEWER (Read-Only Access)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Subscription Plan & Validity Period */}
              <div className={`p-3.5 rounded-lg border space-y-3 ${
                theme === 'light' ? 'bg-slate-50/70 border-slate-200 shadow-xs' : 'bg-slate-950/80 border-slate-800'
              }`}>
                <div className={`font-bold text-xs flex items-center justify-between border-b pb-1.5 ${
                  theme === 'light' ? 'text-slate-800 border-slate-200' : 'text-slate-200 border-slate-800'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <CreditCard size={13} className={theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'} />
                    <span>2. Subscription Plan & Validity Period</span>
                  </div>
                  <span className={`text-[10px] font-mono font-semibold ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}`}>
                    Expiry Preview: {getCalculatedExpiryPreview(userForm.subscriptionDuration, userForm.customExpiresAt)}
                  </span>
                </div>

                {/* Show Current Plan Info When Editing */}
                {editingUser && (
                  <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                    editingUser.subscriptionStatus === 'CANCELLED' || editingUser.subscriptionPlan === 'NO_ACTIVE_PLAN'
                      ? theme === 'light' ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : theme === 'light'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                      : 'bg-indigo-600/10 border-indigo-500/30 text-indigo-300'
                  }`}>
                    <div className="space-y-0.5">
                      <span className={`text-[10px] block uppercase font-mono ${
                        editingUser.subscriptionStatus === 'CANCELLED' || editingUser.subscriptionPlan === 'NO_ACTIVE_PLAN'
                          ? 'text-rose-600 font-semibold'
                          : theme === 'light' ? 'text-indigo-600 font-semibold' : 'text-slate-400'
                      }`}>
                        Current Plan Status
                      </span>
                      <div className={`font-bold text-xs ${
                        editingUser.subscriptionStatus === 'CANCELLED' || editingUser.subscriptionPlan === 'NO_ACTIVE_PLAN'
                          ? 'text-rose-600'
                          : theme === 'light' ? 'text-slate-900' : 'text-white'
                      }`}>
                        {editingUser.subscriptionStatus === 'CANCELLED' || editingUser.subscriptionPlan === 'NO_ACTIVE_PLAN'
                          ? 'No Active Plan (Cancelled / Expired)'
                          : `${editingUser.subscriptionPlan || 'STARTER'} • ${
                              editingUser.subscriptionExpiresAt
                                ? `Expires: ${new Date(editingUser.subscriptionExpiresAt).toLocaleDateString('en-IN')}`
                                : '1 Year'
                            }`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold ${
                        userForm.subscriptionDuration === 'CANCELLED'
                          ? 'text-rose-600'
                          : editingUser.subscriptionStatus === 'CANCELLED' || editingUser.subscriptionPlan === 'NO_ACTIVE_PLAN'
                          ? 'text-rose-500'
                          : editingUser.isExpired
                          ? 'text-rose-500'
                          : theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'
                      }`}>
                        {userForm.subscriptionDuration === 'CANCELLED'
                          ? 'Will Cancel & Expire'
                          : editingUser.subscriptionStatus === 'CANCELLED' || editingUser.subscriptionPlan === 'NO_ACTIVE_PLAN'
                          ? 'Cancelled'
                          : editingUser.daysRemaining !== null ? `${editingUser.daysRemaining} days remaining` : 'Active'}
                      </span>
                      {userForm.subscriptionDuration !== 'CANCELLED' && editingUser.subscriptionStatus !== 'CANCELLED' && editingUser.subscriptionPlan !== 'NO_ACTIVE_PLAN' && (
                        <button
                          type="button"
                          onClick={() => setUserForm((prev) => ({ ...prev, subscriptionDuration: 'CANCELLED' }))}
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-600 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                          title="Cancel / Terminate subscription"
                        >
                          Cancel Plan
                        </button>
                      )}
                      {userForm.subscriptionDuration === 'CANCELLED' && (
                        <button
                          type="button"
                          onClick={() => setUserForm((prev) => ({ ...prev, subscriptionDuration: '1_MONTH' }))}
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-600 border border-indigo-500/30 hover:bg-indigo-500 hover:text-white transition-colors cursor-pointer"
                        >
                          Revert Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Cancel Warning Banner */}
                {userForm.subscriptionDuration === 'CANCELLED' && (
                  <div className={`p-2.5 rounded border text-xs flex items-center gap-2 animate-fade-in ${
                    theme === 'light' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  }`}>
                    <AlertTriangle size={15} className="shrink-0 text-rose-600" />
                    <span>
                      <strong>Plan Cancellation:</strong> Saving changes will immediately cancel and expire this user's subscription.
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={`text-[11px] font-semibold block mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Subscription Plan</label>
                    <select
                      value={userForm.subscriptionPlan}
                      onChange={(e) => setUserForm((prev) => ({ ...prev, subscriptionPlan: e.target.value }))}
                      className={`w-full px-3 py-1.5 rounded text-xs font-bold transition-colors focus:outline-none ${
                        theme === 'light'
                          ? 'bg-white border border-slate-300 text-slate-900 focus:border-indigo-600 shadow-xs'
                          : 'bg-slate-900 border border-slate-800 text-slate-100 focus:border-indigo-500'
                      }`}
                    >
                      <option value="FREE_TRIAL">Free Trial (7 Days)</option>
                      <option value="STARTER">Starter Plan</option>
                      <option value="PROFESSIONAL">Professional Plan</option>
                      <option value="ENTERPRISE">Enterprise Contract</option>
                      <option value="CUSTOM">Custom Plan</option>
                    </select>
                  </div>

                  <div>
                    <label className={`text-[11px] font-semibold block mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Duration Preset</label>
                    <select
                      value={userForm.subscriptionDuration}
                      onChange={(e) => setUserForm((prev) => ({ ...prev, subscriptionDuration: e.target.value }))}
                      className={`w-full px-3 py-1.5 rounded text-xs transition-colors focus:outline-none ${
                        theme === 'light'
                          ? 'bg-white border border-slate-300 text-slate-900 focus:border-indigo-600 shadow-xs'
                          : 'bg-slate-900 border border-slate-800 text-slate-100 focus:border-indigo-500'
                      }`}
                    >
                      <option value="7_DAYS">7 Days Trial</option>
                      <option value="1_MONTH">1 Month</option>
                      <option value="3_MONTHS">3 Months</option>
                      <option value="6_MONTHS">6 Months</option>
                      <option value="1_YEAR">1 Full Year</option>
                      <option value="CUSTOM">Custom Date...</option>
                      <option value="CANCELLED" className="text-rose-600 font-bold">🚫 Cancel / Terminate Plan Now</option>
                    </select>
                  </div>

                  <div>
                    <label className={`text-[11px] font-semibold block mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Max Operator Seats</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={userForm.maxSeats}
                      onChange={(e) => setUserForm((prev) => ({ ...prev, maxSeats: e.target.value }))}
                      className={`w-full px-3 py-1.5 rounded text-xs transition-colors focus:outline-none ${
                        theme === 'light'
                          ? 'bg-white border border-slate-300 text-slate-900 focus:border-indigo-600 shadow-xs'
                          : 'bg-slate-900 border border-slate-800 text-slate-100'
                      }`}
                    />
                  </div>
                </div>

                {userForm.subscriptionDuration === 'CUSTOM' && (
                  <div className={`pt-2 border-t animate-fade-in ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'}`}>
                    <label className={`text-[10px] block mb-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Set Specific Expiry Date</label>
                    <input
                      type="date"
                      value={userForm.customExpiresAt}
                      onChange={(e) => setUserForm((prev) => ({ ...prev, customExpiresAt: e.target.value }))}
                      className={`w-full px-3 py-1.5 rounded text-xs transition-colors focus:outline-none ${
                        theme === 'light'
                          ? 'bg-white border border-slate-300 text-slate-900'
                          : 'bg-slate-900 border border-slate-800 text-slate-100'
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* 3. Service Allocation Matrix */}
              <div className={`p-3.5 rounded-lg border space-y-3 ${
                theme === 'light' ? 'bg-slate-50/70 border-slate-200 shadow-xs' : 'bg-slate-950/80 border-slate-800'
              }`}>
                <div className={`flex items-center justify-between border-b pb-1.5 ${
                  theme === 'light' ? 'border-slate-200' : 'border-slate-800'
                }`}>
                  <div className={`font-bold text-xs flex items-center gap-1.5 ${
                    theme === 'light' ? 'text-slate-800' : 'text-slate-200'
                  }`}>
                    <Sliders size={13} className={theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'} />
                    <span>3. Modular Service Permissions ({userForm.allowedServices.length} active)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <button type="button" onClick={() => applyPreset('ALL')} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline cursor-pointer">All</button>
                    <span className="text-slate-400">•</span>
                    <button type="button" onClick={() => applyPreset('BILLING_ONLY')} className="text-slate-600 dark:text-slate-400 font-medium hover:underline cursor-pointer">Billing</button>
                    <span className="text-slate-400">•</span>
                    <button type="button" onClick={() => applyPreset('CLEAR')} className="text-rose-600 dark:text-rose-400 font-medium hover:underline cursor-pointer">Clear</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SYSTEM_SERVICES.map((srv) => {
                    const checked = userForm.allowedServices.includes(srv.id);
                    return (
                      <label
                        key={srv.id}
                        className={`p-2.5 rounded-lg border cursor-pointer select-none transition-all flex items-start gap-2.5 ${
                          checked
                            ? theme === 'light'
                              ? 'bg-indigo-50/80 border-indigo-300 text-slate-900 shadow-xs'
                              : 'bg-indigo-600/10 border-indigo-500/50 text-slate-100'
                            : theme === 'light'
                            ? 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleService(srv.id)}
                          className="mt-0.5 rounded border-slate-400 text-indigo-600 focus:ring-0 cursor-pointer"
                        />
                        <div className="space-y-0.5">
                          <span className={`font-semibold text-xs block leading-tight ${
                            checked
                              ? theme === 'light' ? 'text-indigo-950' : 'text-slate-100'
                              : theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                          }`}>{srv.label}</span>
                          <span className={`text-[10px] block leading-snug ${
                            theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                          }`}>{srv.description}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className={`text-[11px] font-semibold block mb-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Admin Contract Notes / Payment Reference (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Paid via Bank Wire Ref #99201. Annual contract for 2 billing operators."
                  value={userForm.notes}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className={`w-full p-2.5 rounded text-xs transition-colors focus:outline-none ${
                    theme === 'light'
                      ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600 shadow-xs'
                      : 'bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:border-indigo-500'
                  }`}
                />
              </div>

              {/* Modal Footer */}
              <div className={`flex items-center justify-end gap-2 pt-3 border-t ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'}`}>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className={`rounded text-xs px-3.5 py-1.5 ${
                    theme === 'light'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs px-4 py-2 font-semibold shadow-md shadow-indigo-950/40"
                >
                  {editingUser ? 'Save Changes' : 'Create User & Generate Key'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── USER ACTIVITY & AUDIT TRAIL MODAL ──────────────────────────────── */}
      {isActivityModalOpen && activityTargetUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto"
          onClick={() => setIsActivityModalOpen(false)}
        >
          <div
            className={`rounded-lg max-w-xl w-full p-5 shadow-2xl space-y-4 my-auto max-h-[85vh] flex flex-col border ${
              theme === 'light'
                ? 'bg-white border-slate-200 text-slate-900'
                : 'bg-slate-900 border-slate-800 text-slate-100'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between border-b pb-3 shrink-0 ${
              theme === 'light' ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded flex items-center justify-center border ${
                  theme === 'light'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                    : 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400'
                }`}>
                  <Activity size={16} />
                </div>
                <div>
                  <h2 className={`text-sm font-bold tracking-tight ${
                    theme === 'light' ? 'text-slate-900' : 'text-slate-100'
                  }`}>
                    Activity & Audit Trail: {activityTargetUser.name}
                  </h2>
                  <p className={`text-[11px] font-mono ${
                    theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    License: <span className="font-semibold">{activityTargetUser.licenseKey || 'N/A'}</span> • Plan:{' '}
                    <span className="font-semibold text-indigo-500">{activityTargetUser.subscriptionPlan || 'STARTER'}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsActivityModalOpen(false)}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  theme === 'light' ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
              {loadingActivity ? (
                <div className={`py-8 text-center font-mono ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  <RotateCw size={16} className={`animate-spin inline mr-2 ${theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'}`} />
                  Loading activity timeline...
                </div>
              ) : activityLogs.length === 0 ? (
                <div className={`p-6 rounded-lg text-center border ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400'
                }`}>
                  No activity events recorded yet. Account initialized.
                </div>
              ) : (
                <div className={`space-y-2.5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 ${
                  theme === 'light' ? 'before:bg-slate-200' : 'before:bg-slate-800'
                }`}>
                  {activityLogs.map((log) => {
                    const isLight = theme === 'light';
                    let badgeClass = isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700';
                    let dotClass = 'bg-slate-400';
                    let label = log.action;

                    switch (log.action) {
                      case 'LOGIN':
                        badgeClass = isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
                        dotClass = 'bg-emerald-500';
                        label = 'Login Session';
                        break;
                      case 'LOGIN_FAILED':
                        badgeClass = isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-500/15 text-rose-300 border-rose-500/30';
                        dotClass = 'bg-rose-500';
                        label = 'Login Failed';
                        break;
                      case 'PLAN_EXTENDED':
                      case 'SUBSCRIPTION_EXTENDED':
                        badgeClass = isLight ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-purple-500/20 text-purple-300 border-purple-500/40';
                        dotClass = 'bg-purple-500';
                        label = 'Plan Extended';
                        break;
                      case 'LICENSE_REGENERATED':
                        badgeClass = isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                        dotClass = 'bg-amber-500';
                        label = 'Key Regenerated';
                        break;
                      case 'PASSWORD_RESET':
                      case 'PASSWORD_CHANGED':
                        badgeClass = isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-500/20 text-blue-300 border-blue-500/40';
                        dotClass = 'bg-blue-500';
                        label = 'Password Changed';
                        break;
                      case 'USER_CREATED':
                        badgeClass = isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
                        dotClass = 'bg-indigo-500';
                        label = 'User Created';
                        break;
                      case 'USER_UPDATED':
                        badgeClass = isLight ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
                        dotClass = 'bg-cyan-500';
                        label = 'User Updated';
                        break;
                      default:
                        break;
                    }

                    return (
                      <div key={log.id} className="relative pl-7 py-0.5">
                        <div className={`absolute left-1.5 top-3 w-3 h-3 rounded-full border-2 ${dotClass} ${
                          theme === 'light' ? 'border-white' : 'border-slate-900'
                        }`} />
                        <div className={`p-3 rounded-lg border space-y-1.5 transition-all ${
                          theme === 'light'
                            ? 'bg-slate-50/70 border-slate-200 shadow-xs hover:border-indigo-300 hover:bg-indigo-50/20'
                            : 'bg-slate-950/80 border-slate-800/90 hover:border-slate-700'
                        }`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className={`font-bold text-[10px] font-mono px-2 py-0.5 rounded border tracking-wide uppercase ${badgeClass}`}>
                              {label}
                            </span>
                            <span className={`text-[10px] font-mono ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                              {new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                          </div>
                          <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                            {log.description}
                          </p>
                          {log.performedBy && (
                            <div className={`text-[10px] font-mono flex items-center gap-1 ${
                              theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                            }`}>
                              <span>By:</span>
                              <span className={`font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                                {log.performedBy}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={`pt-3 border-t flex justify-end shrink-0 ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'}`}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsActivityModalOpen(false)}
                className={`rounded text-xs ${
                  theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── PASSWORD RESET MODAL ───────────────────────────────────────────── */}
      {isPasswordModalOpen && passwordTargetUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto"
          onClick={() => setIsPasswordModalOpen(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-md max-w-sm w-full p-5 shadow-2xl space-y-4 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound size={16} className="text-amber-400" />
                <h2 className="text-sm font-bold text-slate-100">Reset Login Password</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-3.5 text-xs">
              <p className="text-slate-300 text-xs">
                Set a new login password for <strong className="text-white">{passwordTargetUser.name}</strong> (
                <span className="font-mono text-indigo-400">{passwordTargetUser.username || passwordTargetUser.email}</span>):
              </p>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">New Password (min 6 chars)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full pl-3 pr-8 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="rounded text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── CUSTOM CONFIRMATION MODAL (NO BROWSER ALERTS) ─────────────────── */}
      {confirmDialog.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in"
          onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-md max-w-sm w-full p-5 shadow-2xl space-y-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  confirmDialog.variant === 'danger'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : confirmDialog.variant === 'warning'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                }`}
              >
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">{confirmDialog.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{confirmDialog.message}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="rounded text-xs px-3 py-1.5"
              >
                {confirmDialog.cancelText || 'Cancel'}
              </Button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className={`px-3 py-1.5 rounded text-xs font-semibold text-white transition-all shadow-md cursor-pointer ${
                  confirmDialog.variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/50'
                    : confirmDialog.variant === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/50'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950/50'
                }`}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
