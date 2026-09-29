import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  AlertCircle, 
  BarChart3, 
  Map, 
  Users, 
  ShieldCheck, 
  Mic, 
  FileText, 
  RotateCw, 
  Settings, 
  HelpCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const VaaniSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { alerts, systemHealth, isOnline, syncState } = useApp();

  const activeAlertsCount = alerts.filter(a => a.status === 'OPEN').length;

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Field Visits', path: '/visits', icon: MapPin },
    { label: 'Alerts', path: '/alerts', icon: AlertCircle, badge: activeAlertsCount || 12 },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Maps', path: '/map', icon: Map },
    { label: 'Patients', path: '/patients', icon: Users },
    { label: 'AI Insights', path: '/ai-insights', icon: ShieldCheck },
    { label: 'Voice Assistant', path: '/voice', icon: Mic },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'Sync Status', path: '/sync', icon: RotateCw },
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'Help & Support', path: '/help', icon: HelpCircle },
  ];

  return (
    <aside className="w-60 bg-[#050B10] border-r border-white/5 py-4 px-3 shrink-0 flex flex-col justify-between hidden lg:flex select-none">
      {/* Navigation List */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/dashboard');

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group text-left ${
                isActive
                  ? 'bg-gradient-to-r from-teal-500/15 to-transparent text-[#00D6C7] border border-teal-500/30 shadow-[0_0_15px_rgba(0,214,199,0.12)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#00D6C7]' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="tracking-wide">{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-[#00D6C7] text-[#050B10]'
                      : 'bg-teal-500/20 text-[#00D6C7] border border-teal-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom System Status Card (matching reference screenshot) */}
      <div 
        onClick={() => navigate('/sync')}
        className="mt-6 p-3 rounded-2xl bg-[#08131B] border border-white/5 hover:border-teal-500/30 cursor-pointer transition-all duration-200 space-y-1"
      >
        <div className="flex items-center gap-2">
          {systemHealth.healthy ? (
            <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-[#43E0B0] flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="text-xs font-bold text-white">System Status</span>
        </div>
        <p className="text-[11px] text-[#43E0B0] font-medium pl-7">
          {systemHealth.healthy ? 'All Systems Operational' : 'Degraded (Offline Queue Ready)'}
        </p>
      </div>
    </aside>
  );
};
