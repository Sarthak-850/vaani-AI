import React from 'react';
import { MapPin, UserPlus, Mic, Cloud } from 'lucide-react';

interface QuickActionsCardProps {
  onNewVisit: () => void;
  onAddPatient: () => void;
  onVoiceQuery: () => void;
  onSyncData: () => void;
  isSyncing?: boolean;
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  onNewVisit,
  onAddPatient,
  onVoiceQuery,
  onSyncData,
  isSyncing = false
}) => {
  const actions = [
    {
      id: 'new-visit',
      title: 'New Visit',
      icon: MapPin,
      onClick: onNewVisit,
      color: 'text-[#00D6C7]'
    },
    {
      id: 'add-patient',
      title: 'Add Patient',
      icon: UserPlus,
      onClick: onAddPatient,
      color: 'text-[#00D6C7]'
    },
    {
      id: 'voice-query',
      title: 'Voice Query',
      icon: Mic,
      onClick: onVoiceQuery,
      color: 'text-[#00D6C7]'
    },
    {
      id: 'sync-data',
      title: 'Sync Data',
      icon: Cloud,
      onClick: onSyncData,
      color: 'text-[#00D6C7]',
      loading: isSyncing
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
      {actions.map((act) => {
        const IconComponent = act.icon;
        return (
          <button
            key={act.id}
            onClick={act.onClick}
            disabled={act.loading}
            className="vaani-glass rounded-2xl p-3 sm:p-3.5 border border-white/10 flex flex-col items-center justify-center gap-2 hover:border-teal-500/30 hover:bg-[#0a1b29] transition-all duration-200 group active:scale-95"
          >
            <div className="w-9 h-9 rounded-full bg-[#050B10]/90 border border-teal-500/20 flex items-center justify-center group-hover:border-teal-500/50 group-hover:shadow-[0_0_12px_rgba(0,214,199,0.3)] transition-all">
              <IconComponent className={`w-4 h-4 ${act.color} ${act.loading ? 'animate-spin' : 'group-hover:scale-110'} transition-transform`} />
            </div>
            <span className="text-[11px] font-semibold text-slate-200 group-hover:text-white text-center whitespace-nowrap">
              {act.title}
            </span>
          </button>
        );
      })}
    </div>
  );
};
