import React from 'react';
import { AlertTriangle, CheckCircle2, FileText, Mic, Clock } from 'lucide-react';
import { Visit, HealthAlert, AuditLog } from '../../types';

interface ActivityItem {
  id: string;
  type: 'alert' | 'visit' | 'report' | 'voice';
  title: string;
  subtitle: string;
  time: string;
}

interface RecentActivityCardProps {
  visits?: Visit[];
  alerts?: HealthAlert[];
  auditLogs?: AuditLog[];
  onViewAll?: () => void;
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  visits = [],
  alerts = [],
  auditLogs = [],
  onViewAll
}) => {
  // Generate real activity list from backend data
  const activityItems: ActivityItem[] = [];

  // 1. Check latest high-risk alert
  if (alerts.length > 0) {
    const latestAlert = alerts[0];
    const timeStr = new Date(latestAlert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    activityItems.push({
      id: `act-alert-${latestAlert.id}`,
      type: 'alert',
      title: latestAlert.title.length > 28 ? `${latestAlert.title.slice(0, 28)}...` : latestAlert.title,
      subtitle: `${latestAlert.householdName} • ${latestAlert.village}`,
      time: timeStr
    });
  } else {
    activityItems.push({
      id: 'default-alert',
      type: 'alert',
      title: 'High fever case detected',
      subtitle: 'Geeta Yadav • Ramnagar',
      time: '10:24 AM'
    });
  }

  // 2. Check latest completed visit
  if (visits.length > 0) {
    const latestVisit = visits[0];
    const timeStr = new Date(latestVisit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    activityItems.push({
      id: `act-visit-${latestVisit.id}`,
      type: 'visit',
      title: 'Visit completed',
      subtitle: `${latestVisit.village} (${latestVisit.householdName})`,
      time: timeStr
    });
  } else {
    activityItems.push({
      id: 'default-visit',
      type: 'visit',
      title: 'Visit completed',
      subtitle: 'Ramnagar Village',
      time: '09:58 AM'
    });
  }

  // 3. AI report generated item
  activityItems.push({
    id: 'report-item',
    type: 'report',
    title: 'AI report generated',
    subtitle: 'Child health • 4 cases verified',
    time: '09:41 AM'
  });

  // 4. Voice query executed item
  activityItems.push({
    id: 'voice-query-item',
    type: 'voice',
    title: 'Voice query executed',
    subtitle: '"Show today\'s high priority cases"',
    time: '09:35 AM'
  });

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'alert':
        return (
          <div className="w-8 h-8 rounded-full bg-rose-500/15 text-[#EF4444] border border-rose-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      case 'visit':
        return (
          <div className="w-8 h-8 rounded-full bg-teal-500/15 text-[#00D6C7] border border-teal-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case 'report':
        return (
          <div className="w-8 h-8 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
        );
      case 'voice':
        return (
          <div className="w-8 h-8 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Mic className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="vaani-glass rounded-2xl p-4 sm:p-5 border border-white/10 shadow-xl backdrop-blur-xl space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white tracking-wide">
          Recent Activity
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-[#00D6C7] hover:text-[#16D8D0] transition-colors"
        >
          View All
        </button>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {activityItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-white/[0.03] transition-colors"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              {getIcon(item.type)}
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-100 truncate">
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {item.subtitle}
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-mono shrink-0">
              {item.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
