import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MapPin, AlertCircle, Mic, Users, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MobileNav: React.FC<{ 
  onOpenMic?: () => void; 
  onOpenNewVisit?: () => void; 
}> = ({ onOpenMic, onOpenNewVisit }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { alerts } = useApp();

  const activeAlertsCount = alerts.filter(a => a.status === 'OPEN').length;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050B10]/95 backdrop-blur-2xl border-t border-white/10 px-3 py-2 flex items-center justify-around select-none">
      <button
        onClick={() => navigate('/')}
        className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold ${
          location.pathname === '/' ? 'text-[#00D6C7]' : 'text-slate-400'
        }`}
      >
        <LayoutDashboard className="w-4 h-4" />
        <span>Home</span>
      </button>

      <button
        onClick={() => navigate('/visits')}
        className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold ${
          location.pathname === '/visits' ? 'text-[#00D6C7]' : 'text-slate-400'
        }`}
      >
        <MapPin className="w-4 h-4" />
        <span>Visits</span>
      </button>

      {/* Floating Center Mic Action */}
      <button
        onClick={() => {
          if (onOpenMic) onOpenMic();
          else navigate('/voice');
        }}
        className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-[#00D6C7] to-[#16D8D0] text-[#050B10] flex items-center justify-center shadow-[0_0_20px_rgba(0,214,199,0.5)] border-2 border-[#050B10] active:scale-95 transition-transform"
      >
        <Mic className="w-6 h-6" />
      </button>

      <button
        onClick={() => navigate('/alerts')}
        className={`relative flex flex-col items-center gap-1 p-1 text-[10px] font-semibold ${
          location.pathname === '/alerts' ? 'text-[#00D6C7]' : 'text-slate-400'
        }`}
      >
        <AlertCircle className="w-4 h-4" />
        <span>Alerts</span>
        {activeAlertsCount > 0 && (
          <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-[#00D6C7]" />
        )}
      </button>

      <button
        onClick={() => navigate('/patients')}
        className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold ${
          location.pathname === '/patients' ? 'text-[#00D6C7]' : 'text-slate-400'
        }`}
      >
        <Users className="w-4 h-4" />
        <span>Patients</span>
      </button>
    </div>
  );
};
