import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Mic, 
  MapPin, 
  Bell, 
  IndianRupee, 
  BarChart3, 
  ShieldCheck, 
  UserCheck, 
  LogOut, 
  LogIn,
  UserPlus,
  ChevronDown, 
  ChevronRight,
  Check, 
  AlertCircle,
  Menu,
  X,
  HeartHandshake,
  User,
  FolderOpen,
  Radio,
  Sliders,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/auth';
import { api } from '../../services/api';
import { UserRole } from '../../types';
import { SyncStatusBadge } from './SyncStatusBadge';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = Boolean(
  clerkPubKey && 
  clerkPubKey.startsWith('pk_') && 
  !clerkPubKey.includes('placeholder') && 
  !clerkPubKey.includes('your_clerk')
);

export const Navbar: React.FC = () => {
  const { currentUser, switchRole, notifications, markNotificationAsRead } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const navDrawerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
      if (navDrawerRef.current && !navDrawerRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (!target.closest('.hamburger-trigger-btn')) {
          setShowMobileNav(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleChange = (role: UserRole) => {
    switchRole(role);
    setShowRoleMenu(false);
    setShowMobileNav(false);
    if (role === 'asha_worker') navigate('/');
    else if (role === 'supervisor') navigate('/dho-dashboard');
    else if (role === 'admin') navigate('/admin');
  };

  const handleLogout = () => {
    api.logout();
    authService.setUser(null);
    setShowMobileNav(false);
    navigate('/login');
  };

  const handleGoogleSignInClick = () => {
    setShowMobileNav(false);
    if (isClerkConfigured && (window as any).Clerk) {
      try {
        (window as any).Clerk.openSignIn({
          appearance: {
            variables: {
              colorPrimary: '#10b981',
              colorBackground: '#0f172a',
              colorText: '#ffffff',
              colorInputBackground: '#1e293b',
              colorInputText: '#ffffff'
            }
          }
        });
        return;
      } catch (e) {
        console.warn('Clerk modal error:', e);
      }
    }
    navigate('/login');
  };

  const handleGoogleSignUpClick = () => {
    setShowMobileNav(false);
    if (isClerkConfigured && (window as any).Clerk) {
      try {
        (window as any).Clerk.openSignUp({
          appearance: {
            variables: {
              colorPrimary: '#10b981',
              colorBackground: '#0f172a',
              colorText: '#ffffff',
              colorInputBackground: '#1e293b',
              colorInputText: '#ffffff'
            }
          }
        });
        return;
      } catch (e) {
        console.warn('Clerk modal error:', e);
      }
    }
    navigate('/login');
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'asha_worker':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'supervisor':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'asha_worker': return 'ASHA Field Worker';
      case 'supervisor': return 'Supervisor / DHO';
      case 'admin': return 'Chief System Admin';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                  Vaani<span className="text-emerald-600"> AI</span>
                </span>
                <span className="block text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest -mt-0.5">
                  Voice Health OS
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {currentUser.role === 'asha_worker' && (
              <>
                <Link
                  to="/"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    location.pathname === '/' 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/log-visit"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    location.pathname === '/log-visit'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Log Visit</span>
                </Link>
                <Link
                  to="/visits"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    location.pathname === '/visits' 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Visits
                </Link>
                <Link
                  to="/earnings"
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    location.pathname === '/earnings' 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <IndianRupee className="w-3 h-3" />
                  <span>Earnings</span>
                </Link>
                <Link
                  to="/alerts"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    location.pathname === '/alerts' 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Alerts
                </Link>
              </>
            )}

            {currentUser.role === 'supervisor' && (
              <>
                <Link
                  to="/dho-dashboard"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    location.pathname === '/dho-dashboard' 
                      ? 'bg-sky-50 text-sky-700' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Supervisor Board
                </Link>
                <Link
                  to="/visits"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    location.pathname === '/visits' 
                      ? 'bg-sky-50 text-sky-700' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Visits
                </Link>
                <Link
                  to="/alerts"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    location.pathname === '/alerts' 
                      ? 'bg-sky-50 text-sky-700' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Alerts
                </Link>
                <Link
                  to="/analytics"
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    location.pathname === '/analytics' 
                      ? 'bg-sky-50 text-sky-700' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Outbreak Analytics</span>
                </Link>
              </>
            )}

            {currentUser.role === 'admin' && (
              <>
                <Link
                  to="/admin"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    location.pathname === '/admin' 
                      ? 'bg-purple-50 text-purple-700' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Admin Control
                </Link>
                <Link
                  to="/dho-dashboard"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  Supervisor View
                </Link>
                <Link
                  to="/analytics"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  Analytics
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Sync Pill */}
            <SyncStatusBadge />

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifMenuRef}>
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                title="Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
                    <span className="text-[11px] text-slate-500">{unreadCount} unread</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-slate-500">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationAsRead(n.id);
                            if (n.link) navigate(n.link);
                            setShowNotifMenu(false);
                          }}
                          className={`p-3 text-left hover:bg-slate-50 transition-colors cursor-pointer ${
                            !n.read ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-semibold text-slate-900">{n.title}</h4>
                            {!n.read && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />}
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Role Switcher Pill */}
            <div className="relative" ref={roleMenuRef}>
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs cursor-pointer ${getRoleBadgeStyle(currentUser.role)}`}
              >
                <div className="w-2 h-2 rounded-full bg-current animate-pulse shrink-0" />
                <span className="hidden sm:inline text-xs">{getRoleLabel(currentUser.role)}</span>
                <span className="sm:hidden text-xs">{currentUser.role === 'asha_worker' ? 'ASHA' : currentUser.role === 'supervisor' ? 'DHO' : 'Admin'}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-1.5 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Role
                    </span>
                  </div>

                  <button
                    onClick={() => handleRoleChange('asha_worker')}
                    className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                      currentUser.role === 'asha_worker' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Rani Devi (ASHA)</div>
                      <div className="text-[10px] text-slate-500">Village Field Voice Log</div>
                    </div>
                    {currentUser.role === 'asha_worker' && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>

                  <button
                    onClick={() => handleRoleChange('supervisor')}
                    className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                      currentUser.role === 'supervisor' ? 'text-sky-700 font-bold bg-sky-50/50' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Dr. Rajesh Sharma (DHO)</div>
                      <div className="text-[10px] text-slate-500">Live Triage Board & GIS Map</div>
                    </div>
                    {currentUser.role === 'supervisor' && <Check className="w-4 h-4 text-sky-600" />}
                  </button>

                  <button
                    onClick={() => handleRoleChange('admin')}
                    className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                      currentUser.role === 'admin' ? 'text-purple-700 font-bold bg-purple-50/50' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Smt. Anjali Patel (Admin)</div>
                      <div className="text-[10px] text-slate-500">Rules & Configuration</div>
                    </div>
                    {currentUser.role === 'admin' && <Check className="w-4 h-4 text-purple-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Hamburger / Account Menu Button */}
            <button
              onClick={() => setShowMobileNav(!showMobileNav)}
              className="hamburger-trigger-btn p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 active:scale-95 transition-all border border-slate-200/80 cursor-pointer shadow-2xs"
              title="Menu & Account"
            >
              {showMobileNav ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-800" />}
            </button>

          </div>
        </div>
      </div>

      {/* Floating Backdrop & Sheet Drawer */}
      {showMobileNav && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 transition-opacity animate-in fade-in duration-150"
            onClick={() => setShowMobileNav(false)}
          />

          {/* Floating Action Sheet Card */}
          <div 
            ref={navDrawerRef}
            className="fixed top-18 right-4 left-4 sm:left-auto sm:w-[400px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 z-50 p-5 space-y-5 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 max-h-[85vh] overflow-y-auto"
          >
            {/* User Profile Card */}
            <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/80 rounded-2xl border border-slate-200/70 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-base shadow-sm overflow-hidden border-2 border-white">
                  {currentUser.profilePhoto ? (
                    <img src={currentUser.profilePhoto} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{currentUser.name}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-[180px]">{currentUser.email}</p>
                  <span className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRoleBadgeStyle(currentUser.role)}`}>
                    {getRoleLabel(currentUser.role)}
                  </span>
                </div>
              </div>
            </div>

            {/* Authentication & Account Actions */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                Account & Authentication
              </span>

              <div className="grid grid-cols-2 gap-2">
                {/* Google Sign In via Clerk */}
                <button
                  onClick={handleGoogleSignInClick}
                  className="w-full p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                  </svg>
                  <span>Google Sign In</span>
                </button>

                {/* Sign Up / Create Account */}
                <button
                  onClick={handleGoogleSignUpClick}
                  className="w-full p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Sign Up</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <Link
                  to="/login"
                  onClick={() => setShowMobileNav(false)}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-600" />
                  <span>Switch User</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Structured Navigation Items with Icons & Chevrons */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1 mb-2">
                Navigation Menu
              </span>

              {currentUser.role === 'asha_worker' && (
                <>
                  <Link
                    to="/"
                    onClick={() => setShowMobileNav(false)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-colors ${
                      location.pathname === '/' 
                        ? 'bg-emerald-50 text-emerald-800' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100/60 text-emerald-700 flex items-center justify-center">
                        <Activity className="w-4 h-4" />
                      </div>
                      <span>Worker Dashboard</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <Link
                    to="/log-visit"
                    onClick={() => setShowMobileNav(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center">
                        <Mic className="w-4 h-4" />
                      </div>
                      <span>Log Household Visit (Voice AI)</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/70" />
                  </Link>

                  <Link
                    to="/visits"
                    onClick={() => setShowMobileNav(false)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-colors ${
                      location.pathname === '/visits' 
                        ? 'bg-emerald-50 text-emerald-800' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                        <FolderOpen className="w-4 h-4" />
                      </div>
                      <span>Field Visits Directory</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <Link
                    to="/earnings"
                    onClick={() => setShowMobileNav(false)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-colors ${
                      location.pathname === '/earnings' 
                        ? 'bg-emerald-50 text-emerald-800' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100/60 text-amber-700 flex items-center justify-center">
                        <IndianRupee className="w-4 h-4" />
                      </div>
                      <span>My Incentives & Earnings</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <Link
                    to="/alerts"
                    onClick={() => setShowMobileNav(false)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-colors ${
                      location.pathname === '/alerts' 
                        ? 'bg-emerald-50 text-emerald-800' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-100/60 text-rose-700 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <span>Health Alerts & Triage</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                </>
              )}

              {currentUser.role === 'supervisor' && (
                <>
                  <Link
                    to="/dho-dashboard"
                    onClick={() => setShowMobileNav(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-sky-800 bg-sky-50/70"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                        <Radio className="w-4 h-4" />
                      </div>
                      <span>Supervisor Board & Map</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-sky-500" />
                  </Link>

                  <Link
                    to="/visits"
                    onClick={() => setShowMobileNav(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                        <FolderOpen className="w-4 h-4" />
                      </div>
                      <span>All Field Visits</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <Link
                    to="/alerts"
                    onClick={() => setShowMobileNav(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-100/60 text-rose-700 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <span>Health Triage Feed</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <Link
                    to="/analytics"
                    onClick={() => setShowMobileNav(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100/60 text-purple-700 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <span>Outbreak Intelligence</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                </>
              )}

              {currentUser.role === 'admin' && (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setShowMobileNav(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-purple-800 bg-purple-50/70"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <span>Admin Control Center</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-500" />
                  </Link>

                  <Link
                    to="/dho-dashboard"
                    onClick={() => setShowMobileNav(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                        <Radio className="w-4 h-4" />
                      </div>
                      <span>Supervisor View</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <Link
                    to="/analytics"
                    onClick={() => setShowMobileNav(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100/60 text-purple-700 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <span>Analytics Suite</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                </>
              )}
            </div>

          </div>
        </>
      )}
    </header>
  );
};
