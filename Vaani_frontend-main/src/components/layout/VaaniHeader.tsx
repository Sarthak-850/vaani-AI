import React, { useState, useRef, useEffect } from 'react';
import { 
  HeartPulse, 
  Search, 
  Check, 
  Bell, 
  ChevronDown, 
  User, 
  LogOut, 
  RefreshCw,
  AlertCircle,
  MapPin,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

interface VaaniHeaderProps {
  onSearchSelect?: (type: 'patient' | 'household' | 'visit', item: any) => void;
  onOpenNewVisit?: () => void;
  onOpenAddPatient?: () => void;
}

export const VaaniHeader: React.FC<VaaniHeaderProps> = ({ 
  onSearchSelect,
  onOpenNewVisit,
  onOpenAddPatient
}) => {
  const { 
    currentUser, 
    switchRole, 
    notifications, 
    markNotificationAsRead,
    syncState, 
    systemHealth, 
    patients, 
    households, 
    visits,
    isOnline
  } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter items matching query
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const matchedPatients = trimmedQuery
    ? patients.filter(p => p.name.toLowerCase().includes(trimmedQuery) || p.patientCategory?.toLowerCase().includes(trimmedQuery)).slice(0, 4)
    : [];
  const matchedHouseholds = trimmedQuery
    ? households.filter(h => h.familyName.toLowerCase().includes(trimmedQuery) || h.village.toLowerCase().includes(trimmedQuery)).slice(0, 4)
    : [];
  const matchedVisits = trimmedQuery
    ? visits.filter(v => v.transcript.toLowerCase().includes(trimmedQuery) || v.structuredData?.symptoms?.some(s => s.toLowerCase().includes(trimmedQuery))).slice(0, 4)
    : [];

  const unreadNotifs = notifications.filter(n => !n.read);

  return (
    <header className="sticky top-0 z-40 bg-[#050B10]/90 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* 1. Left Branding */}
      <div 
        onClick={() => navigate('/')}
        className="flex items-center gap-3 cursor-pointer shrink-0 group select-none"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00D6C7] to-[#43E0B0] p-0.5 shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-all">
          <div className="w-full h-full bg-[#050B10] rounded-[14px] flex items-center justify-center">
            <HeartPulse className="w-5 h-5 text-[#00D6C7]" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-[#00D6C7] transition-colors">
              Vaani <span className="text-[#00D6C7]">AI</span>
            </span>
          </div>
          <p className="text-[10px] font-bold text-[#00D6C7]/80 tracking-widest uppercase">
            AI VOICE HEALTH OS
          </p>
        </div>
      </div>

      {/* 2. Center Global Search Pill */}
      <div ref={searchRef} className="flex-1 max-w-xl hidden md:block relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search patients, households, symptoms..."
            className="w-full bg-[#0a1622]/90 text-xs sm:text-sm text-slate-100 placeholder-slate-400 pl-4 pr-10 py-2.5 rounded-full border border-white/10 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all shadow-inner"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {isSearchFocused && trimmedQuery && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#08131B] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto p-2 space-y-2">
            {matchedPatients.length === 0 && matchedHouseholds.length === 0 && matchedVisits.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching records found for "{searchQuery}"
              </div>
            ) : (
              <>
                {matchedPatients.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[10px] font-bold text-[#00D6C7] uppercase tracking-wider">
                      Patients
                    </div>
                    {matchedPatients.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setIsSearchFocused(false);
                          navigate('/patients');
                          if (onSearchSelect) onSearchSelect('patient', p);
                        }}
                        className="px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-white">{p.name}</span>
                        <span className="text-[11px] text-slate-400">{p.patientCategory} • {p.age ? `${p.age}y` : 'Age N/A'}</span>
                      </div>
                    ))}
                  </div>
                )}

                {matchedHouseholds.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[10px] font-bold text-[#43E0B0] uppercase tracking-wider">
                      Households
                    </div>
                    {matchedHouseholds.map(h => (
                      <div
                        key={h.id}
                        onClick={() => {
                          setIsSearchFocused(false);
                          navigate('/map');
                          if (onSearchSelect) onSearchSelect('household', h);
                        }}
                        className="px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-white">{h.familyName}</span>
                        <span className="text-[11px] text-slate-400">{h.village} • {h.address}</span>
                      </div>
                    ))}
                  </div>
                )}

                {matchedVisits.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      Clinical Visits
                    </div>
                    {matchedVisits.map(v => (
                      <div
                        key={v.id}
                        onClick={() => {
                          setIsSearchFocused(false);
                          navigate('/visits');
                          if (onSearchSelect) onSearchSelect('visit', v);
                        }}
                        className="px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer text-xs"
                      >
                        <div className="font-semibold text-white">{v.householdName} ({v.severity.toUpperCase()})</div>
                        <div className="text-[11px] text-slate-400 truncate">{v.transcript}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* 3. Right Controls */}
      <div className="flex items-center gap-3">
        {/* Cloud Synced Pill */}
        <div 
          onClick={() => navigate('/sync')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#08131B] border border-teal-500/30 text-[#00D6C7] text-xs font-semibold cursor-pointer hover:border-teal-500/50 transition-all select-none"
        >
          {syncState === 'syncing' ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00D6C7]" />
          ) : (
            <Check className="w-3.5 h-3.5 text-[#00D6C7]" />
          )}
          <span>{syncState === 'syncing' ? 'Syncing...' : (isOnline ? 'Cloud Synced' : 'Offline Buffer')}</span>
        </div>

        {/* Notifications Bell */}
        <div ref={notifRef} className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            aria-label="View notifications"
            className="relative p-2 rounded-xl bg-[#08131B] hover:bg-[#0c1f2e] border border-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00D6C7] text-[#050B10] text-[9px] font-black flex items-center justify-center shadow-[0_0_8px_#00D6C7]">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#08131B] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-3 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
                <span className="font-bold text-white">Notifications ({unreadNotifs.length})</span>
                <span className="text-[10px] text-teal-400">Real-Time Alerts</span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1.5">
                {notifications.slice(0, 5).map(n => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationAsRead(n.id)}
                    className={`p-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                      n.read ? 'bg-transparent text-slate-400' : 'bg-white/5 text-slate-200 border border-teal-500/20'
                    }`}
                  >
                    <div className="font-bold text-white text-[11px]">{n.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{n.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 pl-2 border-l border-white/10 hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00D6C7] to-[#43E0B0] text-[#050B10] font-black text-xs flex items-center justify-center shadow-md">
              {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'AW'}
            </div>
            <div className="hidden lg:flex items-center gap-1.5 text-left">
              <span className="text-xs font-bold text-slate-100">
                {currentUser?.name || 'ASHA Worker'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </button>

          {/* Profile Menu Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#08131B] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-2 text-xs space-y-1">
              <div className="p-2 border-b border-white/10">
                <div className="font-bold text-white">{currentUser?.name}</div>
                <div className="text-[10px] text-teal-400 capitalize">{currentUser?.role.replace('_', ' ')} • {currentUser?.village}</div>
              </div>

              <div className="py-1">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase">Switch Active Role</div>
                <button
                  onClick={() => { switchRole('asha_worker'); setIsProfileOpen(false); }}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white"
                >
                  ASHA Field Worker
                </button>
                <button
                  onClick={() => { switchRole('supervisor'); setIsProfileOpen(false); }}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white"
                >
                  Supervisor (DHO)
                </button>
                <button
                  onClick={() => { switchRole('admin'); setIsProfileOpen(false); }}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white"
                >
                  State Administrator
                </button>
              </div>

              <div className="pt-1 border-t border-white/10">
                <button
                  onClick={() => { navigate('/login'); setIsProfileOpen(false); }}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign In / Switch Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
