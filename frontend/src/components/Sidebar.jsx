import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  Shield, LayoutDashboard, Users, FileText,
  Car, FolderOpen, BarChart2, MessageSquare, LogOut, DollarSign
} from 'lucide-react';

const allNavItems = [
  { to: 'dashboard',  label: 'Dashboard',        icon: LayoutDashboard, roles: ['SUPERVISOR', 'CLAIMS_OFFICER', 'OPERATIONS_MANAGER', 'BRANCH_MANAGER', 'FINANCE_EXECUTIVE'] },
  { to: 'customers',  label: 'Customers',         icon: Users,           roles: ['SUPERVISOR'] },
  { to: 'claims',     label: 'Claims Queue',      icon: FileText,        roles: ['CLAIMS_OFFICER', 'SUPERVISOR', 'OPERATIONS_MANAGER', 'FINANCE_EXECUTIVE'] },
  { to: 'policies',   label: 'Policies',          icon: Shield,          roles: ['OPERATIONS_MANAGER'] },
  { to: 'vehicles',   label: 'Vehicles',          icon: Car,             roles: ['OPERATIONS_MANAGER', 'SUPERVISOR'] },
  { to: 'documents',  label: 'Documents',         icon: FolderOpen,      roles: ['BRANCH_MANAGER', 'SUPERVISOR', 'CLAIMS_OFFICER'] },
  { to: 'payments',   label: 'Payments Ledger',   icon: DollarSign,      roles: ['FINANCE_EXECUTIVE', 'OPERATIONS_MANAGER', 'SUPERVISOR'] },
  { to: 'reports',    label: 'Reports',           icon: BarChart2,       roles: ['OPERATIONS_MANAGER', 'FINANCE_EXECUTIVE'] },
  { to: 'feedback',   label: 'Feedback',          icon: MessageSquare,   roles: ['SUPERVISOR'] },
];

const roleColors = {
  SUPERVISOR:          'from-violet-500 to-purple-600',
  CLAIMS_OFFICER:      'from-amber-500 to-orange-600',
  OPERATIONS_MANAGER:  'from-emerald-500 to-teal-600',
  BRANCH_MANAGER:      'from-sky-500 to-blue-600',
  FINANCE_EXECUTIVE:   'from-pink-500 to-rose-600',
};

const roleLabels = {
  SUPERVISOR:          'Supervisor',
  CLAIMS_OFFICER:      'Claims Officer',
  OPERATIONS_MANAGER:  'Ops Manager',
  BRANCH_MANAGER:      'Branch Manager',
  FINANCE_EXECUTIVE:   'Finance Exec',
};

const Sidebar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = allNavItems.filter(item => item.roles.includes(role));
  const gradient = roleColors[role] || 'from-blue-500 to-indigo-600';

  return (
    <aside className="flex flex-col h-full w-64 border-r border-slate-800 bg-slate-950">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-extrabold text-white text-sm tracking-tight leading-none">MotorGuard</p>
          <p className="text-xs text-slate-500 mt-0.5">Staff Portal</p>
        </div>
      </div>

      {/* User profile */}
      <div className="px-4 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl bg-slate-900/60">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white text-sm flex-shrink-0`}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500">{roleLabels[role] || role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="section-label px-2 mb-3">Navigation</p>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            id={`nav-${to}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-blue-500/20' : 'bg-slate-800/50 group-hover:bg-slate-700/60'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {label}
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-800">
        <button
          id="staff-logout"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 group"
        >
          <div className="p-1 rounded-lg bg-slate-800/50 group-hover:bg-red-500/20 transition-colors">
            <LogOut className="w-4 h-4" />
          </div>
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
