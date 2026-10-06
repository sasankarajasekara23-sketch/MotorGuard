import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  Shield, Car, FileText, Bell, ChevronDown,
  LogOut, User, LayoutDashboard, AlignJustify, X, CreditCard, Home
} from 'lucide-react';

const navLinks = [
  { to: '/overview',  label: 'Overview',   icon: Home },
  { to: '/vehicles',  label: 'Vehicles',   icon: Car },
  { to: '/policies',  label: 'Policies',   icon: Shield },
  { to: '/claims',    label: 'Claims',     icon: FileText },
  { to: '/payments',  label: 'Payments',   icon: CreditCard },
  { to: '/documents', label: 'Documents',  icon: AlignJustify },
  { to: '/feedback',  label: 'Feedback',   icon: Bell },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-800"
      style={{ background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(16px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/overview" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/50 group-hover:shadow-blue-700/50 transition-shadow">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-extrabold text-white tracking-tight">MotorGuard</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-0.5 xl:gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 xl:gap-2 px-2 lg:px-2.5 xl:px-3.5 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-150 ${
                  isActive(to)
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right: Profile + mobile toggle */}
          <div className="flex items-center gap-3">
            {/* Profile Dropdown */}
            <div className="relative hidden md:block">
              <button
                id="profile-menu-btn"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden lg:inline text-sm font-medium text-slate-300">{user?.name?.split(' ')[0]}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 card p-1.5 space-y-0.5 shadow-2xl z-50 animate-in"
                  onBlur={() => setProfileOpen(false)}>
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-xs text-slate-500">Signed in as</p>
                    <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <Link to="/profile" onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-slate-300 rounded-lg hover:bg-slate-800 transition-colors">
                    <User className="w-4 h-4 text-slate-500" />
                    My Profile
                  </Link>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-400 rounded-lg hover:bg-red-500/10 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <LayoutDashboard className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-800 px-4 py-3 space-y-1 animate-in"
          style={{ background: 'rgba(2, 6, 23, 0.95)' }}>
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(to)
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}>
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          <div className="border-t border-slate-800 pt-2 mt-2 space-y-1">
            <Link to="/profile" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800">
              <User className="w-4 h-4" /> My Profile
            </Link>
            <button onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
